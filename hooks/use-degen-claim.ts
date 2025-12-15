"use client";

import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { useMemo } from "react";
import useSWR from "swr";
import { useReadContract } from "wagmi";
import { z } from "zod";
import { dailyRewardsAbi } from "@/lib/abi/daily-rewards";
import { BASE_CHAIN_ID } from "@/lib/constants";
import { getDailyRewardsAddress, normalizeChainId } from "@/lib/utils";

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

type FormattedClaimEligibility = {
  claimStatus: ClaimEligibility | undefined;
  canClaim: boolean;
  reward: bigint;
  vaultBalance: bigint;
};

function formatClaimEligibility(
  claimStatus: ClaimEligibility | undefined
): FormattedClaimEligibility {
  return {
    claimStatus,
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
  if (!address || fid === undefined || !contractAddress) {
    return;
  }
  return [address as `0x${string}`, fid as bigint];
}

function shouldQueryEligibility(params: {
  enabled: boolean;
  address: string | undefined;
  fid: bigint | undefined;
  contractAddress: string;
  isBaseChain: boolean;
}): boolean {
  return (
    params.enabled &&
    Boolean(params.address) &&
    params.fid !== undefined &&
    Boolean(params.contractAddress) &&
    params.isBaseChain
  );
}

export function useClaimEligibility({
  fid,
  enabled = true,
}: UseClaimEligibilityProps) {
  const { address } = useAppKitAccount({ namespace: "eip155" });
  const { chainId } = useAppKitNetwork();
  const contractAddress = getDailyRewardsAddress(BASE_CHAIN_ID);

  // Claims are only supported on Base.
  // We explicitly check if the user is on Base to ensure consistency.
  const isBaseChain = normalizeChainId(chainId) === BASE_CHAIN_ID;

  const args = buildClaimEligibilityArgs(address, fid, contractAddress);
  const shouldQuery = shouldQueryEligibility({
    enabled,
    address,
    fid,
    contractAddress,
    isBaseChain,
  });

  const {
    data: claimStatus,
    isPending,
    isError,
    refetch: refetchContract,
  } = useReadContract({
    chainId: BASE_CHAIN_ID,
    address: (contractAddress as `0x${string}`) || undefined,
    abi: dailyRewardsAbi,
    functionName: "canClaimToday",
    args,
    query: {
      enabled: shouldQuery,
      refetchInterval: REFETCH_ELIGIBILITY_MS,
    },
  });

  const refetch = refetchContract;

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

const claimStatsSchema = z.object({
  count: z.number().int().nonnegative(),
});

type FetchError = Error & {
  status?: number;
  body?: string;
};

export function useClaimStats() {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/claims/stats",
    async (url: string) => {
      try {
        // Add cache-busting timestamp to bypass CDN cache when fetching fresh data
        const cacheBustUrl = `${url}?_t=${Date.now()}`;
        const res = await fetch(cacheBustUrl, {
          cache: "no-store",
        });

        if (!res.ok) {
          let errorBody: string;
          try {
            errorBody = await res.text();
          } catch {
            errorBody = "(unable to read response body)";
          }

          const message = `Failed to fetch stats: ${res.status} ${res.statusText}`;
          const fetchError: FetchError = new Error(message);
          fetchError.status = res.status;
          fetchError.body = errorBody;
          throw fetchError;
        }

        const json = await res.json();
        return claimStatsSchema.parse(json);
      } catch (err) {
        // Re-throw AbortError as-is to signal cancellation
        if (err instanceof Error && err.name === "AbortError") {
          throw err;
        }
        throw err;
      }
    },
    {
      refreshInterval: 30_000, // Refresh every 30 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  return {
    count: data?.count ?? 0,
    isLoading,
    isError: Boolean(error),
    mutate,
  };
}
