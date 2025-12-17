import { DAILY_CLAIM_LIMIT } from "@/lib/constants";

export type ClaimState = {
  isEligible: boolean;
  isFidBlacklisted: boolean;
  fidClaimedToday: boolean;
  globalLimitReached: boolean;
  hasSentGMToday: boolean;
  reward: bigint;
};

export type ClaimEligibility = {
  ok: boolean;
  fidIsBlacklisted: boolean;
  fidClaimedToday: boolean;
  globalLimitReached: boolean;
  hasSentGMToday: boolean;
  reward: bigint;
  vaultBalance: bigint;
  minReserve: bigint;
};

export function extractClaimState(
  claimStatus: ClaimEligibility | undefined
): ClaimState {
  return {
    isEligible: claimStatus?.ok ?? false,
    isFidBlacklisted: claimStatus?.fidIsBlacklisted ?? false,
    fidClaimedToday: claimStatus?.fidClaimedToday ?? false,
    globalLimitReached: claimStatus?.globalLimitReached ?? false,
    hasSentGMToday: claimStatus?.hasSentGMToday ?? false,
    reward: claimStatus?.reward ?? 0n,
  };
}

export function getStatusConfig(state: ClaimState) {
  if (state.isFidBlacklisted) {
    return {
      title: "Access Restricted",
      description: "FID is blacklisted from claiming rewards",
      accentColor: "text-red-600 dark:text-red-400",
    };
  }
  if (state.fidClaimedToday) {
    return {
      title: "Claimed Today",
      description: "You've already claimed your daily rewards",
      accentColor: "text-green-600 dark:text-green-400",
    };
  }
  if (state.globalLimitReached) {
    return {
      title: "Daily Limit Reached",
      description: `The daily claim limit of ${DAILY_CLAIM_LIMIT} users has been reached`,
      accentColor: "text-orange-600 dark:text-orange-400",
    };
  }
  if (!state.hasSentGMToday) {
    return {
      title: "Send GM First",
      description: "Send a GM on Base to become eligible for rewards",
      accentColor: "text-blue-600 dark:text-blue-400",
    };
  }
  if (state.isEligible) {
    return {
      title: "Ready to Claim",
      description: "Your daily rewards are available",
      accentColor: "text-yellow-600 dark:text-yellow-400",
    };
  }
  return {
    title: "Not Eligible",
    description: "Complete requirements to claim rewards",
    accentColor: "text-muted-foreground",
  };
}
