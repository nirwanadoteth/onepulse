import React from "react";

type FallbackUIProps = {
  type: "wallet" | "gm-first";
};

/**
 * Fallback UI shown when user cannot claim due to missing prerequisites.
 */
export const ClaimFallbackUI = React.memo(({ type }: FallbackUIProps) => {
  const message =
    type === "wallet"
      ? "Connect your wallet to claim rewards"
      : "Send GM first to claim rewards";

  return (
    <div className="w-full rounded-lg border border-border bg-muted p-4 text-center text-muted-foreground text-sm">
      {message}
    </div>
  );
});
