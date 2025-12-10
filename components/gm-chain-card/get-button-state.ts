export type ButtonState = {
  label: string;
  disabled: boolean;
  showFallback: "wallet" | "gm-first" | "low-score" | null;
};

type GetButtonStateParams = {
  isConnected: boolean;
  isEligibilityPending: boolean;
  hasSentGMToday: boolean;
  canClaim: boolean;
  scoreCheckPassed?: boolean;
  userScore?: number;
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
  scoreCheckPassed,
  userScore,
}: GetButtonStateParams): ButtonState {
  if (!isConnected) {
    return {
      label: "Connect wallet",
      disabled: true,
      showFallback: "wallet",
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

  if (scoreCheckPassed === false) {
    return {
      label: `Low Score (${userScore?.toFixed(2) ?? "N/A"})`,
      disabled: true,
      showFallback: "low-score",
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
