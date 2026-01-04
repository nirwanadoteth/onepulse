"use client";

import { useConnection } from "wagmi";
import {
  dailyRewardsV2Address,
  useReadDailyRewardsV2CanClaimToday,
  useReadDailyRewardsV2DailyClaimCount,
} from "@/helpers/contracts";
import { useMiniAppSharing } from "@/hooks/use-mini-app-sharing";
import type { ChainId } from "@/lib/constants";

type UseClaimEligibilityProps = {
  fid: bigint | undefined;
  enabled?: boolean;
  chainId: ChainId;
};

type ContractClaimEligibility = {
  ok: boolean;
  fidIsBlacklisted: boolean;
  fidClaimedToday: boolean;
  globalLimitReached: boolean;
  hasSentGMToday: boolean;
  reward: bigint;
  vaultBalance: bigint;
  minReserve: bigint;
  globalClaimsToday: bigint;
  globalClaimLimit: bigint;
};

type ClaimEligibility = ContractClaimEligibility & {
  hasSharedMiniAppToday: boolean;
};

const SIGNATURE_DEADLINE_SECONDS = 300; // 5 minutes
const REFETCH_ELIGIBILITY_MS = 1000; // 1 second (more responsive)

type FormattedClaimEligibility = {
  claimStatus: ClaimEligibility | undefined;
  canClaim: boolean;
  reward: bigint;
  vaultBalance: bigint;
};

function formatClaimEligibility(
  claimStatus: ContractClaimEligibility | undefined,
  hasSharedToday: boolean
): FormattedClaimEligibility {
  const baseCanClaim = claimStatus?.ok ?? false;
  // User must have sent GM, shared the mini app, and meet other criteria
  const canClaim = baseCanClaim && hasSharedToday;

  return {
    claimStatus: claimStatus
      ? { ...claimStatus, hasSharedMiniAppToday: hasSharedToday }
      : undefined,
    canClaim,
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
}): boolean {
  return (
    params.enabled &&
    Boolean(params.address) &&
    params.fid !== undefined &&
    Boolean(params.contractAddress)
  );
}

export function useClaimEligibility({
  fid,
  enabled = true,
  chainId,
}: UseClaimEligibilityProps) {
  const { address } = useConnection();
  const { hasSharedToday } = useMiniAppSharing();

  const contractAddress = dailyRewardsV2Address[chainId];

  const args = buildClaimEligibilityArgs(address, fid, contractAddress);
  const shouldQuery = shouldQueryEligibility({
    enabled,
    address,
    fid,
    contractAddress,
  });

  const {
    data: claimStatus,
    isPending,
    isError,
    refetch: refetchContract,
  } = useReadDailyRewardsV2CanClaimToday({
    chainId,
    args,
    query: {
      enabled: shouldQuery,
      refetchInterval: REFETCH_ELIGIBILITY_MS,
    },
  });

  const refetch = refetchContract;

  return {
    ...formatClaimEligibility(claimStatus, hasSharedToday),
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
  if (customDeadline) {
    return customDeadline;
  }
  return BigInt(Math.floor(Date.now() / 1000) + SIGNATURE_DEADLINE_SECONDS);
}

/**
 * Hook to get today's daily claim count from a specific chain.
 * This shows how many claims have been made today on that chain.
 * If no chainId is provided, defaults to the current connected chain.
 */
export function useDailyClaimCount(chainId: ChainId) {
  const secondsPerDay = 86_400;
  const today = BigInt(Math.floor(Date.now() / 1000 / secondsPerDay));

  const { data: dailyCount } = useReadDailyRewardsV2DailyClaimCount({
    args: [today],
    chainId,
    query: {
      enabled: true,
      refetchInterval: 1000, // Refresh every 1 second
    },
  });

  return Number(dailyCount ?? 0n);
}
