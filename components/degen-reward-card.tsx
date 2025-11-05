"use client"

import React from "react"
import { useAccount } from "wagmi"

import {
  useClaimEligibility,
  useRewardVaultStatus,
} from "@/hooks/use-degen-claim"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
} from "@/components/ui/item"
import { DegenClaimTransaction } from "@/components/gm-chain-card/degen-claim-transaction"

interface DegenRewardCardProps {
  fid: bigint | undefined
}

interface ClaimState {
  isEligible: boolean
  hasAlreadyClaimed: boolean
  isFidBlacklisted: boolean
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
  claimStatus: ClaimEligibility | undefined
): ClaimState {
  return {
    isEligible: claimStatus?.ok ?? false,
    hasAlreadyClaimed: claimStatus?.claimerClaimedToday ?? false,
    isFidBlacklisted: claimStatus?.fidIsBlacklisted ?? false,
    reward: claimStatus?.reward ?? 0n,
  }
}

function getStatusIcon(state: ClaimState): string {
  if (state.isFidBlacklisted) return "🚫"
  if (state.hasAlreadyClaimed) return "✅"
  if (state.isEligible) return "✨"
  return "💰"
}

function getStatusText(state: ClaimState): string {
  if (state.isFidBlacklisted) return "FID Blacklisted"
  if (state.hasAlreadyClaimed) return "Claimed Today"
  if (state.isEligible) return "Ready to Claim"
  return "Not Eligible"
}

function getStatusBgColor(state: ClaimState): string {
  if (state.isEligible) return "bg-yellow-100"
  if (state.hasAlreadyClaimed) return "bg-green-100"
  return "bg-red-100"
}

interface SimpleCardProps {
  icon: string
  bgColor: string
  description: string
}

function SimpleRewardCard({ icon, bgColor, description }: SimpleCardProps) {
  return (
    <Item variant="outline">
      <ItemMedia>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full ${bgColor}`}
        >
          <span className="text-lg">{icon}</span>
        </div>
      </ItemMedia>
      <ItemContent>
        <p className="text-foreground font-semibold">DEGEN Rewards</p>
        <ItemDescription>{description}</ItemDescription>
      </ItemContent>
    </Item>
  )
}

function DisconnectedCard() {
  return (
    <SimpleRewardCard
      icon="💰"
      bgColor="bg-yellow-100"
      description="Connect wallet to claim daily rewards"
    />
  )
}

function DepletedVaultCard() {
  return (
    <SimpleRewardCard
      icon="⏸️"
      bgColor="bg-gray-100"
      description="Vault depleted - check back soon"
    />
  )
}

interface RewardCardBodyProps {
  fid: bigint | undefined
  state: ClaimState
  isCheckingEligibility: boolean
}

function RewardCardBody({
  fid,
  state,
  isCheckingEligibility,
}: RewardCardBodyProps) {
  return (
    <Item variant="outline">
      <ItemMedia>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full ${getStatusBgColor(state)}`}
        >
          <span className="text-lg">{getStatusIcon(state)}</span>
        </div>
      </ItemMedia>
      <ItemContent>
        <p className="text-foreground font-semibold">DEGEN Rewards</p>
        <ItemDescription className="flex items-center gap-1">
          <span>{getStatusText(state)}</span>
          {!isCheckingEligibility && state.reward > 0n && (
            <span className="text-sm font-medium text-yellow-600">
              • {(Number(state.reward) / 1e18).toFixed(2)} DEGEN available
            </span>
          )}
        </ItemDescription>
      </ItemContent>
      <ItemActions className="w-32">
        {isCheckingEligibility ? (
          <div className="flex h-10 w-full items-center justify-center">
            <div className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
          </div>
        ) : (
          <DegenClaimTransaction fid={fid} disabled={!state.isEligible} />
        )}
      </ItemActions>
    </Item>
  )
}

export const DegenRewardCard = React.memo(function DegenRewardCard({
  fid,
}: DegenRewardCardProps) {
  const { address, isConnected } = useAccount()
  const { claimStatus, isPending: isCheckingEligibility } = useClaimEligibility(
    {
      fid,
      enabled: isConnected,
    }
  )
  const { hasRewards } = useRewardVaultStatus()

  if (!isConnected || !address) {
    return <DisconnectedCard />
  }

  if (!hasRewards) {
    return <DepletedVaultCard />
  }

  const claimState = extractClaimState(claimStatus)
  return (
    <RewardCardBody
      fid={fid}
      state={claimState}
      isCheckingEligibility={isCheckingEligibility}
    />
  )
})
