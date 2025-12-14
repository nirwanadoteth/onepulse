"use client";

import { useAppKitAccount } from "@reown/appkit/react";
import { useMemo } from "react";
import useSWR from "swr";
import { useReadContract } from "wagmi";
import { dailyRewardsAbi } from "@/lib/abi/daily-rewards";
import { BASE_CHAIN_ID } from "@/lib/constants";
import { getDailyRewardsAddress } from "@/lib/utils";

type UseClaimEligibilityProps = {
  fid: bigint | undefined;
  enabled?: boolean;
};

type ClaimEligibility = {
  ok: boolean;
  fidIsBlacklisted: boolean;
  fidClaimedToday: boolean;
  claimerClaimedToday: boolean;
  hasSentGMToday: boolean;
  reward: bigint;
  vaultBalance: bigint;
  minReserve: bigint;
};

const SIGNATURE_DEADLINE_SECONDS = 300; // 5 minutes
const REFETCH_ELIGIBILITY_MS = 3000; // 3 seconds (more responsive)
const REFETCH_VAULT_MS = 120_000; // 120 seconds

function formatClaimEligibility(claimStatus: ClaimEligibility | undefined) {
  return {
    claimStatus: claimStatus as ClaimEligibility | undefined,
    canClaim: claimStatus?.ok ?? false,
    reward: claimStatus?.reward ?? 0n,
    vaultBalance: claimStatus?.vaultBalance ?? 0n,
  };
}

function buildClaimEligibilityArgs(
  address: string | undefined,
  fid: bigint | undefined,
  contractAddress: string
): readonly [`0x${string}`, bigint] | undefined {
  if (!(address && fid && contractAddress)) {
    return;
  }
  return [address as `0x${string}`, fid as bigint];
}

function shouldQueryEligibility(
  enabled: boolean,
  address: string | undefined,
  fid: bigint | undefined,
  contractAddress: string
): boolean {
  return enabled && !!address && !!fid && !!contractAddress;
}

export function useClaimEligibility({
  fid,
  enabled = true,
}: UseClaimEligibilityProps) {
  const { address } = useAppKitAccount({ namespace: "eip155" });
  const contractAddress = getDailyRewardsAddress(BASE_CHAIN_ID);
  const args = buildClaimEligibilityArgs(address, fid, contractAddress);
  const shouldQuery = shouldQueryEligibility(
    enabled,
    address,
    fid,
    contractAddress
  );

  const {
    data: claimStatus,
    isPending,
    isError,
    refetch: refetchContract,
  } = useReadContract({
    address: (contractAddress as `0x${string}`) || undefined,
    abi: dailyRewardsAbi,
    functionName: "canClaimToday",
    args,
    query: {
      enabled: shouldQuery,
      refetchInterval: REFETCH_ELIGIBILITY_MS,
    },
  });

  // Comprehensive refetch that includes all data sources
  const refetch = async () => {
    await Promise.all([refetchContract()]);
  };

  return {
    ...formatClaimEligibility(claimStatus),
    hasSentGMToday: claimStatus?.hasSentGMToday ?? false,
    isPending,
    isError,
    refetch,
  };
}

/**
 * Hook to get the deadline for claim signatures.
 * Returns a timestamp 1 hour in the future.
 */
export function useClaimDeadline(customDeadline?: bigint): bigint {
  return useMemo(() => {
    if (customDeadline) {
      return customDeadline;
    }
    return BigInt(Math.floor(Date.now() / 1000) + SIGNATURE_DEADLINE_SECONDS);
  }, [customDeadline]);
}

export function useRewardVaultStatus() {
  const contractAddress = getDailyRewardsAddress(BASE_CHAIN_ID);

  const { data: vaultStatus, isPending } = useReadContract({
    address: (contractAddress as `0x${string}`) || undefined,
    abi: dailyRewardsAbi,
    functionName: "getVaultStatus",
    chainId: BASE_CHAIN_ID,
    query: {
      enabled: contractAddress !== "",
      refetchInterval: REFETCH_VAULT_MS,
    },
  });

  return {
    balance: vaultStatus?.[0] ?? 0n,
    minReserve: vaultStatus?.[1] ?? 0n,
    available: vaultStatus?.[2] ?? 0n,
    isPending,
    hasRewards: (vaultStatus?.[2] ?? 0n) > 0n,
  };
}

export function useClaimStats() {
  const { data, error, isLoading } = useSWR<{ count: number }>(
    "/api/claims/stats",
    async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Failed to fetch stats");
      }
      return res.json();
    },
    {
      refreshInterval: 30_000, // Refresh every 30 seconds
    }
  );

  return {
    count: data?.count ?? 0,
    isLoading,
    isError: error,
  };
}
