"use client"

import React from "react"
import { useMiniKit } from "@coinbase/onchainkit/minikit"
import { useAccount } from "wagmi"

import { DegenRewardCard } from "@/components/degen-reward-card"

export function RewardsBase() {
  const { isConnected } = useAccount()
  const { context } = useMiniKit()

  // Get FID from context - Farcaster provides this
  const fid = context?.user?.fid ? BigInt(context.user.fid) : undefined

  return (
    <div className="mt-4 space-y-4">
      {!isConnected ? (
        <div className="border-border bg-muted/50 rounded-lg border p-6 text-center">
          <p className="text-foreground font-medium">
            Connect your wallet to claim DEGEN rewards
          </p>
          <p className="text-muted-foreground mt-2 text-sm">
            Earn 5 DEGEN tokens every day on Base
          </p>
        </div>
      ) : !fid ? (
        <div className="border-border bg-muted/50 rounded-lg border p-6 text-center">
          <p className="text-foreground font-medium">
            Verifying Farcaster identity...
          </p>
          <p className="text-muted-foreground mt-2 text-sm">
            Loading your rewards status
          </p>
        </div>
      ) : (
        <>
          <DegenRewardCard fid={fid} />
          <div className="border-border bg-card rounded-lg border p-4 text-sm">
            <p className="text-foreground mb-2 font-semibold">How it works</p>
            <ul className="text-muted-foreground space-y-2">
              <li>✓ Claim 5 DEGEN tokens once per day</li>
              <li>✓ Requires valid Farcaster identity</li>
              <li>✓ One claim per FID per day</li>
              <li>✓ Tokens sent directly to your wallet</li>
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
