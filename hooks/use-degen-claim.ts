"use client"

import { useCallback, useMemo } from "react"
import { useAccount, useReadContract, useSignTypedData } from "wagmi"

import { dailyRewardsAbi } from "@/lib/abi/daily-rewards"
import { getDailyRewardsAddress } from "@/lib/constants"

interface UseClaimEligibilityProps {
  fid: bigint | undefined
  enabled?: boolean
}

interface ClaimEligibility {
  ok: boolean
  fidIsBlacklisted: boolean
  fidClaimedToday: boolean
  claimerClaimedToday: boolean
  reward: bigint
  vaultBalance: bigint
  minReserve: bigint
}

const CHAIN_ID = 8453
const SIGNATURE_DEADLINE_SECONDS = 3600 // 1 hour
const REFETCH_ELIGIBILITY_MS = 10000 // 10 seconds
const REFETCH_VAULT_MS = 30000 // 30 seconds

function formatClaimEligibility(claimStatus: ClaimEligibility | undefined) {
  return {
    claimStatus: claimStatus as ClaimEligibility | undefined,
    canClaim: claimStatus?.ok ?? false,
    reward: claimStatus?.reward ?? 0n,
    vaultBalance: claimStatus?.vaultBalance ?? 0n,
  }
}

function buildClaimEligibilityArgs(
  address: string | undefined,
  fid: bigint | undefined,
  contractAddress: string
): readonly [`0x${string}`, bigint] | undefined {
  if (!address || !fid || !contractAddress) return undefined
  return [address as `0x${string}`, fid]
}

function shouldQueryEligibility(
  enabled: boolean,
  address: string | undefined,
  fid: bigint | undefined,
  contractAddress: string
): boolean {
  return enabled && !!address && !!fid && contractAddress !== ""
}

export function useClaimEligibility({
  fid,
  enabled = true,
}: UseClaimEligibilityProps) {
  const { address } = useAccount()
  const contractAddress = getDailyRewardsAddress(CHAIN_ID)
  const args = buildClaimEligibilityArgs(address, fid, contractAddress)
  const shouldQuery = shouldQueryEligibility(
    enabled,
    address,
    fid,
    contractAddress
  )

  const {
    data: claimStatus,
    isPending,
    isError,
    refetch,
  } = useReadContract({
    address: (contractAddress as `0x${string}`) || undefined,
    abi: dailyRewardsAbi,
    functionName: "canClaimToday",
    args,
    query: {
      enabled: shouldQuery,
      refetchInterval: REFETCH_ELIGIBILITY_MS,
    },
  })

  return {
    ...formatClaimEligibility(claimStatus),
    isPending,
    isError,
    refetch,
  }
}

interface UseDegenClaimSignatureProps {
  fid: bigint | undefined
  deadline?: bigint
}

function useSignatureDeadline(customDeadline?: bigint): bigint {
  return useMemo(() => {
    if (customDeadline) return customDeadline
    return BigInt(Math.floor(Date.now() / 1000) + SIGNATURE_DEADLINE_SECONDS)
  }, [customDeadline])
}

function useUserNonce(address: string | undefined) {
  const contractAddress = getDailyRewardsAddress(CHAIN_ID)
  const { data: userInfo, isPending } = useReadContract({
    address: (contractAddress as `0x${string}`) || undefined,
    abi: dailyRewardsAbi,
    functionName: "userInfo",
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address && contractAddress !== "",
    },
  })

  return {
    nonce: userInfo ? (userInfo[1] as bigint) : undefined,
    isPending,
  }
}

function createClaimMessage(
  address: `0x${string}`,
  fid: bigint,
  nonce: bigint,
  deadline: bigint,
  contractAddress: string
) {
  return {
    account: address,
    domain: {
      name: "DailyRewards",
      version: "1",
      chainId: CHAIN_ID,
      verifyingContract: contractAddress as `0x${string}`,
    },
    types: {
      Claim: [
        { name: "claimer", type: "address" },
        { name: "fid", type: "uint256" },
        { name: "deadline", type: "uint256" },
        { name: "nonce", type: "uint256" },
      ],
    },
    primaryType: "Claim" as const,
    message: {
      claimer: address,
      fid,
      deadline,
      nonce,
    },
  }
}

export function useDegenClaimSignature({
  deadline,
}: UseDegenClaimSignatureProps) {
  const { address } = useAccount()
  const { signTypedDataAsync, isPending: isSigning } = useSignTypedData()
  const contractAddress = getDailyRewardsAddress(CHAIN_ID)
  const signatureDeadline = useSignatureDeadline(deadline)
  const { nonce, isPending: isNoncePending } = useUserNonce(address)

  const generateSignature = useCallback(
    async (fidToSign: bigint) => {
      if (!address || !nonce) {
        throw new Error("Missing required parameters for signature")
      }

      const messageData = createClaimMessage(
        address as `0x${string}`,
        fidToSign,
        nonce,
        signatureDeadline,
        contractAddress
      )

      const signature = await signTypedDataAsync(
        messageData as Parameters<typeof signTypedDataAsync>[0]
      )

      return {
        signature,
        nonce,
        deadline: signatureDeadline,
      }
    },
    [address, nonce, signTypedDataAsync, signatureDeadline, contractAddress]
  )

  return {
    generateSignature,
    isSigning,
    isNoncePending,
    deadline: signatureDeadline,
  }
}

export function useRewardVaultStatus() {
  const contractAddress = getDailyRewardsAddress(CHAIN_ID)

  const { data: vaultStatus, isPending } = useReadContract({
    address: (contractAddress as `0x${string}`) || undefined,
    abi: dailyRewardsAbi,
    functionName: "getVaultStatus",
    query: {
      enabled: contractAddress !== "",
      refetchInterval: REFETCH_VAULT_MS,
    },
  })

  return {
    balance: vaultStatus?.[0] ?? 0n,
    minReserve: vaultStatus?.[1] ?? 0n,
    available: vaultStatus?.[2] ?? 0n,
    isPending,
    hasRewards: (vaultStatus?.[2] ?? 0n) > 0n,
  }
}
