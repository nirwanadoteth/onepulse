"use client"

import { useMemo } from "react"
import { useAccount, useReadContract } from "wagmi"

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
  hasSentGMToday: boolean
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
  return [address as `0x${string}`, fid as bigint]
}

function shouldQueryEligibility(
  enabled: boolean,
  address: string | undefined,
  fid: bigint | undefined,
  contractAddress: string
): boolean {
  return enabled && !!address && !!fid && !!contractAddress
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
    hasSentGMToday: claimStatus?.hasSentGMToday ?? false,
    isPending,
    isError,
    refetch,
  }
}

/**
 * Hook to get the deadline for claim signatures.
 * Returns a timestamp 1 hour in the future.
 */
export function useClaimDeadline(customDeadline?: bigint): bigint {
  return useMemo(() => {
    if (customDeadline) return customDeadline
    return BigInt(Math.floor(Date.now() / 1000) + SIGNATURE_DEADLINE_SECONDS)
  }, [customDeadline])
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
