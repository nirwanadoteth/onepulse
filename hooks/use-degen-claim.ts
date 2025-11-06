"use client"

import { useCallback, useMemo } from "react"
import { useAccount, useReadContract, useSignTypedData } from "wagmi"

import { dailyRewardsAbi } from "@/lib/abi/daily-rewards"
import { dailyGMAbi } from "@/lib/abi/daily-gm"
import { getDailyRewardsAddress, getDailyGmAddress } from "@/lib/constants"

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
  if (!hasRequiredClaimEligibilityInputs(address, fid, contractAddress))
    return undefined
  return [address as `0x${string}`, fid as bigint]
}

function shouldQueryEligibility(
  enabled: boolean,
  address: string | undefined,
  fid: bigint | undefined,
  contractAddress: string
): boolean {
  return (
    enabled && hasRequiredClaimEligibilityInputs(address, fid, contractAddress)
  )
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

  const { hasSentGMToday, isPending: isGMPending } = useHasSentGMToday()

  return {
    ...formatClaimEligibility(claimStatus),
    hasSentGMToday,
    isPending: isPending || isGMPending,
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

function validateSignatureRequirements(
  address: string | undefined,
  nonce: bigint | undefined
): { address: `0x${string}`; nonce: bigint } {
  const missingAddress = !address
  const nonceMissing = nonce === undefined || nonce === null

  if (missingAddress || nonceMissing) {
    const missing: string[] = []
    if (missingAddress) missing.push("address")
    if (nonceMissing) missing.push("nonce")
    throw new Error(
      `Missing required parameters for signature: ${missing.join(", ")}`
    )
  }

  return {
    address: address as `0x${string}`,
    nonce,
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
      // Validate required parameters before proceeding
      const { address: validatedAddress, nonce: validatedNonce } =
        validateSignatureRequirements(address, nonce)

      const messageData = createClaimMessage(
        validatedAddress,
        fidToSign,
        validatedNonce,
        signatureDeadline,
        contractAddress
      )

      const signature = await signTypedDataAsync(
        messageData as Parameters<typeof signTypedDataAsync>[0]
      )

      return {
        signature,
        nonce: validatedNonce,
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
    // expose the nonce so callers can know whether it's available
    nonce,
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

function hasRequiredClaimEligibilityInputs(
  address: string | undefined,
  fid: bigint | undefined,
  contractAddress: string
): boolean {
  return Boolean(address && fid && contractAddress)
}

function getCurrentDay(): bigint {
  return BigInt(Math.floor(Date.now() / 1000 / 86400))
}

export function useHasSentGMToday() {
  const { address } = useAccount()
  const gmContractAddress = getDailyGmAddress(CHAIN_ID)

  const { data: lastGMDay, isPending } = useReadContract({
    address: (gmContractAddress as `0x${string}`) || undefined,
    abi: dailyGMAbi,
    functionName: "lastGMDay",
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address && gmContractAddress !== "",
      refetchInterval: REFETCH_ELIGIBILITY_MS,
    },
  })

  const currentDay = getCurrentDay()
  const hasSentGMToday = lastGMDay !== undefined && lastGMDay === currentDay

  return {
    hasSentGMToday,
    lastGMDay,
    isPending,
  }
}
