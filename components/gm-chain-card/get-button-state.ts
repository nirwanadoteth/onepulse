export type ButtonState = {
  label: string;
  disabled: boolean;
  showFallback: "wallet" | "gm-first" | "limit-reached" | null;
};

type GetButtonStateParams = {
  isConnected: boolean;
  isEligibilityPending: boolean;
  hasSentGMToday: boolean;
  canClaim: boolean;
  isDailyLimitReached: boolean;
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
}: GetButtonStateParams): ButtonState {
  if (!isConnected) {
    return {
      label: "Connect wallet",
      disabled: true,
      showFallback: "wallet",
    };
  }

  if (isDailyLimitReached) {
    return {
      label: "Daily Limit Reached",
      disabled: true,
      showFallback: "limit-reached",
    };
  }

  if (!hasSentGMToday) {
    return {
      label: "Send GM First",
      disabled: true,
      showFallback: "gm-first",
    };
  }

  if (isEligibilityPending) {
    return {
      label: "Checking eligibility...",
      disabled: true,
      showFallback: null,
    };
  }

  if (!canClaim) {
    return {
      label: "Already Claimed",
      disabled: true,
      showFallback: null,
    };
  }

  return {
    label: "Claim Rewards",
    disabled: false,
    showFallback: null,
  };
}
