import React from "react"

interface FallbackUIProps {
  type: "wallet" | "gm-first"
}

/**
 * Fallback UI shown when user cannot claim due to missing prerequisites.
 */
export const ClaimFallbackUI = React.memo(function ClaimFallbackUI({
  type,
}: FallbackUIProps) {
  const message =
    type === "wallet"
      ? "Connect your wallet to claim rewards"
      : "Send GM first to claim rewards"

  return (
    <div className="border-border bg-muted text-muted-foreground w-full rounded-lg border p-4 text-center text-sm">
      {message}
    </div>
  )
})
