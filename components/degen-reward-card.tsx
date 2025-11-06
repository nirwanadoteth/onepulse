"use client"

import React from "react"
import { useAccount } from "wagmi"

import {
  useClaimEligibility,
  useRewardVaultStatus,
} from "@/hooks/use-degen-claim"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { DegenClaimTransaction } from "@/components/gm-chain-card/degen-claim-transaction"

interface DegenRewardCardProps {
  fid: bigint | undefined
}

interface ClaimState {
  isEligible: boolean
  hasAlreadyClaimed: boolean
  isFidBlacklisted: boolean
  hasSentGMToday: boolean
  reward: bigint
}

interface ClaimEligibility {
  ok: boolean
  fidIsBlacklisted: boolean
  fidClaimedToday: boolean
  claimerClaimedToday: boolean
  reward: bigint
  vaultBalance: bigint
  minReserve: bigint
}

function extractClaimState(
  claimStatus: ClaimEligibility | undefined,
  hasSentGMToday: boolean
): ClaimState {
  return {
    isEligible: claimStatus?.ok ?? false,
    hasAlreadyClaimed: claimStatus?.claimerClaimedToday ?? false,
    isFidBlacklisted: claimStatus?.fidIsBlacklisted ?? false,
    hasSentGMToday,
    reward: claimStatus?.reward ?? 0n,
  }
}

function getStatusConfig(state: ClaimState) {
  if (state.isFidBlacklisted) {
    return {
      title: "Access Restricted",
      description: "FID is blacklisted from claiming rewards",
      accentColor: "text-red-600 dark:text-red-400",
    }
  }
  if (state.hasAlreadyClaimed) {
    return {
      title: "Claimed Today",
      description: "You've already claimed your daily rewards",
      accentColor: "text-green-600 dark:text-green-400",
    }
  }
  if (!state.hasSentGMToday) {
    return {
      title: "Send GM First",
      description: "Send a GM on Base to become eligible for rewards",
      accentColor: "text-blue-600 dark:text-blue-400",
    }
  }
  if (state.isEligible) {
    return {
      title: "Ready to Claim",
      description: "Your daily DEGEN rewards are available",
      accentColor: "text-yellow-600 dark:text-yellow-400",
    }
  }
  return {
    title: "Not Eligible",
    description: "Complete requirements to claim rewards",
    accentColor: "text-muted-foreground",
  }
}

interface RewardCardProps {
  fid: bigint | undefined
  state: ClaimState
  isCheckingEligibility: boolean
}

function RewardCard({ fid, state, isCheckingEligibility }: RewardCardProps) {
  const config = getStatusConfig(state)

  return (
    <Card className="border-border/50">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className={`text-xl font-semibold ${config.accentColor}`}>
              {config.title}
            </h3>
            <p className="text-muted-foreground text-sm">
              {config.description}
            </p>
          </div>
          {!isCheckingEligibility && state.reward > 0n && (
            <div className="text-right">
              <div className="text-3xl font-light tracking-tight">
                {(Number(state.reward) / 1e18).toFixed(0)}
              </div>
              <div className="text-muted-foreground text-xs uppercase tracking-wider">
                DEGEN
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <DegenClaimTransaction fid={fid} disabled={!state.isEligible} />

        {isCheckingEligibility && (
          <div className="text-muted-foreground mt-4 flex items-center gap-2 text-xs">
            <div className="border-primary h-3 w-3 animate-spin rounded-full border border-t-transparent" />
            Checking eligibility
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function DisconnectedCard() {
  return (
    <Card className="border-border/50">
      <CardContent className="py-12 text-center">
        <div className="space-y-3">
          <h3 className="text-xl font-semibold">Connect Wallet</h3>
          <p className="text-muted-foreground text-sm">
            Connect your wallet to access daily DEGEN rewards
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function DepletedVaultCard() {
  return (
    <Card className="border-border/50">
      <CardContent className="py-12 text-center">
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-muted-foreground">
            Vault Depleted
          </h3>
          <p className="text-muted-foreground text-sm">
            The reward vault is currently empty. Check back soon.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export const DegenRewardCard = React.memo(function DegenRewardCard({
  fid,
}: DegenRewardCardProps) {
  const { address, isConnected } = useAccount()
  const {
    claimStatus,
    hasSentGMToday,
    isPending: isCheckingEligibility,
  } = useClaimEligibility({
    fid,
    enabled: isConnected,
  })
  const { hasRewards } = useRewardVaultStatus()

  if (!isConnected || !address) {
    return <DisconnectedCard />
  }

  if (!hasRewards) {
    return <DepletedVaultCard />
  }

  const claimState = extractClaimState(claimStatus, hasSentGMToday)
  return (
    <RewardCard
      fid={fid}
      state={claimState}
      isCheckingEligibility={isCheckingEligibility}
    />
  )
})
