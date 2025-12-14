import { DAILY_CLAIM_LIMIT } from "@/lib/constants";

export type ClaimState = {
  isEligible: boolean;
  hasAlreadyClaimed: boolean;
  isFidBlacklisted: boolean;
  hasSentGMToday: boolean;
  isDailyLimitReached: boolean;
  reward: bigint;
};

export type ClaimEligibility = {
  ok: boolean;
  fidIsBlacklisted: boolean;
  fidClaimedToday: boolean;
  claimerClaimedToday: boolean;
  reward: bigint;
  vaultBalance: bigint;
  minReserve: bigint;
};

export function extractClaimState(
  claimStatus: ClaimEligibility | undefined,
  hasSentGMToday: boolean,
  dailyClaimsCount: number
): ClaimState {
  const isDailyLimitReached = dailyClaimsCount >= DAILY_CLAIM_LIMIT;
  return {
    isEligible: (claimStatus?.ok ?? false) && !isDailyLimitReached,
    hasAlreadyClaimed: claimStatus?.claimerClaimedToday ?? false,
    isFidBlacklisted: claimStatus?.fidIsBlacklisted ?? false,
    hasSentGMToday,
    isDailyLimitReached,
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
  if (state.hasAlreadyClaimed) {
    return {
      title: "Claimed Today",
      description: "You've already claimed your daily rewards",
      accentColor: "text-green-600 dark:text-green-400",
    };
  }
  if (state.isDailyLimitReached) {
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
      description: "Your daily DEGEN rewards are available",
      accentColor: "text-yellow-600 dark:text-yellow-400",
    };
  }
  return {
    title: "Not Eligible",
    description: "Complete requirements to claim rewards",
    accentColor: "text-muted-foreground",
  };
}
