"use client";

import { useAppKitAccount } from "@reown/appkit/react";
import { useMemo } from "react";
import { useReadContract } from "wagmi";
import { dailyRewardsAbi } from "@/lib/abi/daily-rewards";
import { BASE_CHAIN_ID, SCORE_THRESHOLD } from "@/lib/constants";
import { getDailyRewardsAddress } from "@/lib/utils";
import { useGmStats } from "./use-gm-stats";
import { useScore } from "./use-score";

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

const MIN_STREAK_FOR_LOW_SCORE = 3;
const SIGNATURE_DEADLINE_SECONDS = 300; // 5 minutes
const REFETCH_ELIGIBILITY_MS = 10_000; // 10 seconds (more responsive)
const REFETCH_VAULT_MS = 120_000; // 120 seconds

function formatClaimEligibility(
  claimStatus: ClaimEligibility | undefined,
  scoreCheckPassed: boolean,
  userScore: number,
  currentStreak: number
) {
  // High score: can claim normally
  if (scoreCheckPassed) {
    return {
      claimStatus: claimStatus as ClaimEligibility | undefined,
      canClaim: claimStatus?.ok ?? false,
      reward: claimStatus?.reward ?? 0n,
      vaultBalance: claimStatus?.vaultBalance ?? 0n,
      userScore,
      scoreCheckPassed,
      currentStreak,
      streakCheckPassed: true,
    };
  }

  // Low score: need streak >= 3 to claim
  const streakCheckPassed = currentStreak >= MIN_STREAK_FOR_LOW_SCORE;
  return {
    claimStatus: claimStatus as ClaimEligibility | undefined,
    canClaim: (claimStatus?.ok ?? false) && streakCheckPassed,
    reward: claimStatus?.reward ?? 0n,
    vaultBalance: claimStatus?.vaultBalance ?? 0n,
    userScore,
    scoreCheckPassed,
    currentStreak,
    streakCheckPassed,
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

  // Fetch user's Neynar score
  const {
    score,
    isLoading: isScoreLoading,
    mutate: mutateScore,
  } = useScore(fid ? Number(fid) : undefined);
  const userScore = score?.[0]?.score ?? 0;
  const scoreCheckPassed = userScore > SCORE_THRESHOLD;

  // Fetch user's GM stats to get current streak
  const { stats: gmStats } = useGmStats(address, BASE_CHAIN_ID);
  const currentStreak = gmStats?.currentStreak ?? 0;

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
    await Promise.all([
      refetchContract(),
      mutateScore(), // Refetch score from SWR
    ]);
  };

  return {
    ...formatClaimEligibility(
      claimStatus,
      scoreCheckPassed,
      userScore,
      currentStreak
    ),
    hasSentGMToday: claimStatus?.hasSentGMToday ?? false,
    isPending: isPending || isScoreLoading,
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
