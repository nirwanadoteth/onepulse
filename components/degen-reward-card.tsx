"use client"

import React from "react"
import { useAccount, useChainId, useSwitchChain } from "wagmi"
import { base } from "wagmi/chains"

import {
  useClaimEligibility,
  useRewardVaultStatus,
} from "@/hooks/use-degen-claim"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { DegenClaimTransaction } from "@/components/gm-chain-card/degen-claim-transaction"

interface DegenRewardCardProps {
  fid: bigint | undefined
  sponsored: boolean
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
  sponsored: boolean
  state: ClaimState
  isCheckingEligibility: boolean
}

function RewardCard({
  fid,
  sponsored,
  state,
  isCheckingEligibility,
}: RewardCardProps) {
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
              <div className="text-muted-foreground text-xs tracking-wider uppercase">
                DEGEN
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <DegenClaimTransaction
          fid={fid}
          sponsored={sponsored}
          disabled={!state.isEligible}
        />

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

interface StatusCardProps {
  title: string
  description: string
  titleClassName?: string
}

function StatusCard({ title, description, titleClassName }: StatusCardProps) {
  return (
    <Card className="border-border/50">
      <CardContent className="py-12 text-center">
        <div className="space-y-3">
          <h3 className={`text-xl font-semibold ${titleClassName || ""}`}>
            {title}
          </h3>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function DisconnectedCard() {
  return (
    <StatusCard
      title="Connect Wallet"
      description="Connect your wallet to access daily DEGEN rewards"
    />
  )
}

function DepletedVaultCard() {
  return (
    <StatusCard
      title="Vault Depleted"
      description="The reward vault is currently empty. Check back soon."
      titleClassName="text-muted-foreground"
    />
  )
}

function WrongNetworkCard() {
  const { switchChain } = useSwitchChain()

  const handleSwitchToBase = () => {
    switchChain({ chainId: base.id })
  }

  return (
    <Card className="border-border/50">
      <CardContent className="py-12 text-center">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Switch to Base</h3>
          <p className="text-muted-foreground text-sm">
            DEGEN rewards are only available on Base network
          </p>
          <Button
            onClick={handleSwitchToBase}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Switch to Base
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export const DegenRewardCard = React.memo(function DegenRewardCard({
  fid,
  sponsored,
}: DegenRewardCardProps) {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
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

  // Check if user is on Base network (chainId 8453)
  if (chainId !== base.id) {
    return <WrongNetworkCard />
  }

  if (!hasRewards) {
    return <DepletedVaultCard />
  }

  const claimState = extractClaimState(claimStatus, hasSentGMToday)
  return (
    <RewardCard
      fid={fid}
      sponsored={sponsored}
      state={claimState}
      isCheckingEligibility={isCheckingEligibility}
    />
  )
})
