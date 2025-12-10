import { memo } from "react";

type FallbackUIProps = {
  type: "wallet" | "gm-first" | "low-score" | null;
};

/**
 * Fallback UI shown when user cannot claim due to missing prerequisites.
 */
export const ClaimFallbackUI = memo(({ type }: FallbackUIProps) => {
  if (!type) {
    return null;
  }

  const messages = {
    wallet: "Connect your wallet to claim rewards",
    "gm-first": "Send GM first to claim rewards",
    "low-score": "Your account score is too low to claim rewards",
  };

  const message = messages[type];

  return (
    <div className="w-full rounded-lg border border-border bg-muted p-4 text-center text-muted-foreground text-sm">
      {message}
    </div>
  );
});
