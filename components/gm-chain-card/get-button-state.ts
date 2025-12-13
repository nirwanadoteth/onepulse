export type ButtonState = {
  label: string;
  disabled: boolean;
  showFallback: "wallet" | "gm-first" | "limit-reached" | null;
  requiresVerification: boolean;
};

type GetButtonStateParams = {
  isConnected: boolean;
  isEligibilityPending: boolean;
  hasSentGMToday: boolean;
  canClaim: boolean;
  isDailyLimitReached: boolean;
  isVerified: boolean;
};

/**
 * Determines the button state based on eligibility and connection status.
 * Uses a flat decision tree to minimize cyclomatic complexity.
 */
export function getButtonState({
  isConnected,
  isEligibilityPending,
  hasSentGMToday,
  canClaim,
  isDailyLimitReached,
  isVerified,
}: GetButtonStateParams): ButtonState {
  if (!isConnected) {
    return {
      label: "Connect wallet",
      disabled: true,
      showFallback: "wallet",
      requiresVerification: false,
    };
  }

  if (isDailyLimitReached) {
    return {
      label: "Daily Limit Reached",
      disabled: true,
      showFallback: "limit-reached",
      requiresVerification: false,
    };
  }

  if (!hasSentGMToday) {
    return {
      label: "Send GM First",
      disabled: true,
      showFallback: "gm-first",
      requiresVerification: false,
    };
  }

  if (isEligibilityPending) {
    return {
      label: "Checking eligibility...",
      disabled: true,
      showFallback: null,
      requiresVerification: false,
    };
  }

  if (!canClaim) {
    return {
      label: "Already Claimed",
      disabled: true,
      showFallback: null,
      requiresVerification: false,
    };
  }

  if (!isVerified) {
    return {
      label: "Verify & Claim",
      disabled: false,
      showFallback: null,
      requiresVerification: true,
    };
  }

  return {
    label: "Claim Rewards",
    disabled: false,
    showFallback: null,
    requiresVerification: false,
  };
}
