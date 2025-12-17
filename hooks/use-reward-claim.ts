"use client";

import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { useMemo } from "react";
import { useReadContract } from "wagmi";
import { dailyRewardsAbi } from "@/lib/abi/daily-rewards";
import { dailyRewardsV2Abi } from "@/lib/abi/daily-rewards-v2";
import {
  BASE_CHAIN_ID,
  CELO_CHAIN_ID,
  OPTIMISM_CHAIN_ID,
} from "@/lib/constants";
import { getDailyRewardsV2Address, normalizeChainId } from "@/lib/utils";

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
const REFETCH_VAULT_MS = 3000; // 3 seconds (more responsive)

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
  const contractAddress = getDailyRewardsV2Address(BASE_CHAIN_ID);

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
  const contractAddress = getDailyRewardsV2Address(BASE_CHAIN_ID);

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

/**
 * Hook to check if any supported chain has available rewards.
 * Returns true if at least one chain has a non-zero vault balance.
 */
export function useMultichainVaultStatus() {
  const baseContractAddress = getDailyRewardsV2Address(BASE_CHAIN_ID);
  const celoContractAddress = getDailyRewardsV2Address(CELO_CHAIN_ID);
  const optimismContractAddress = getDailyRewardsV2Address(OPTIMISM_CHAIN_ID);

  const { data: baseVault, isPending: baseLoading } = useReadContract({
    address: (baseContractAddress as `0x${string}`) || undefined,
    abi: dailyRewardsAbi,
    functionName: "getVaultStatus",
    chainId: BASE_CHAIN_ID,
    query: {
      enabled: baseContractAddress !== "",
      refetchInterval: REFETCH_VAULT_MS,
    },
  });

  const { data: celoVault, isPending: celoLoading } = useReadContract({
    address: (celoContractAddress as `0x${string}`) || undefined,
    abi: dailyRewardsAbi,
    functionName: "getVaultStatus",
    chainId: CELO_CHAIN_ID,
    query: {
      enabled: celoContractAddress !== "",
      refetchInterval: REFETCH_VAULT_MS,
    },
  });

  const { data: optimismVault, isPending: optimismLoading } = useReadContract({
    address: (optimismContractAddress as `0x${string}`) || undefined,
    abi: dailyRewardsAbi,
    functionName: "getVaultStatus",
    chainId: OPTIMISM_CHAIN_ID,
    query: {
      enabled: optimismContractAddress !== "",
      refetchInterval: REFETCH_VAULT_MS,
    },
  });

  const baseAvailable = baseVault?.[2] ?? 0n;
  const celoAvailable = celoVault?.[2] ?? 0n;
  const optimismAvailable = optimismVault?.[2] ?? 0n;
  const hasAnyRewards =
    baseAvailable > 0n || celoAvailable > 0n || optimismAvailable > 0n;

  return {
    base: { available: baseAvailable, hasRewards: baseAvailable > 0n },
    celo: { available: celoAvailable, hasRewards: celoAvailable > 0n },
    optimism: {
      available: optimismAvailable,
      hasRewards: optimismAvailable > 0n,
    },
    hasAnyRewards,
    isPending: baseLoading || celoLoading || optimismLoading,
  };
}

/**
 * Hook to get today's daily claim count from a specific chain.
 * This shows how many claims have been made today on that chain.
 * If no chainId is provided, defaults to the current connected chain.
 */
export function useDailyClaimCount(chainId?: number) {
  const { chainId: connectedChainId } = useAppKitNetwork();
  const normalizedConnectedChainId = normalizeChainId(connectedChainId);
  const activeChainId = chainId ?? normalizedConnectedChainId ?? BASE_CHAIN_ID;
  const contractAddress = getDailyRewardsV2Address(activeChainId);

  const secondsPerDay = 86_400;
  const today = BigInt(Math.floor(Date.now() / 1000 / secondsPerDay));

  const { data: dailyCount } = useReadContract({
    address: (contractAddress as `0x${string}`) || undefined,
    abi: dailyRewardsV2Abi,
    functionName: "dailyClaimCount",
    args: [today],
    chainId: activeChainId as number,
    query: {
      enabled: contractAddress !== "",
      refetchInterval: 60_000, // Refresh every minute
    },
  });

  return Number(dailyCount ?? 0n);
}

/**
 * Hook to get total daily claim counts across all supported chains.
 * Returns an object with counts per chain and total.
 */
export function useMultichainDailyClaimCounts() {
  const baseCount = useDailyClaimCount(BASE_CHAIN_ID);
  const celoCount = useDailyClaimCount(CELO_CHAIN_ID);
  const optimismCount = useDailyClaimCount(OPTIMISM_CHAIN_ID);

  return {
    base: baseCount,
    celo: celoCount,
    optimism: optimismCount,
    total: baseCount + celoCount + optimismCount,
  };
}
