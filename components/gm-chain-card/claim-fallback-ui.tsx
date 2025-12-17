import { memo } from "react";

type FallbackUIProps = {
  type:
    | "wallet"
    | "gm-first"
    | "limit-reached"
    | "multichain-limit-reached"
    | null;
  chainName?: string;
};

/**
 * Fallback UI shown when user cannot claim due to missing prerequisites.
 */
export const ClaimFallbackUI = memo(({ type, chainName }: FallbackUIProps) => {
  if (!type) {
    return null;
  }

  const messages = {
    wallet: "Connect your wallet to claim rewards",
    "gm-first": "Send GM first to claim rewards",
    "limit-reached": `Daily claim limit reached on ${chainName || "this chain"}. Try again tomorrow or claim on another chain.`,
    "multichain-limit-reached":
      "Multichain daily claim limit reached across all chains. Try again tomorrow.",
  };

  const message = messages[type];

  return (
    <div className="w-full rounded-lg border border-border bg-muted p-4 text-center text-muted-foreground text-sm">
      {message}
    </div>
  );
});
