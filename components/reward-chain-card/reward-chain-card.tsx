"use client";

import { memo } from "react";
import { RewardClaimTransaction } from "@/components/gm-chain-card/reward-claim-transaction";
import { Icons } from "@/components/icons";
import { useRewardChainCardLogic } from "@/components/reward-chain-card/use-reward-chain-card-logic";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemMedia,
} from "@/components/ui/item";
import {
  BASE_CHAIN_ID,
  CELO_CHAIN_ID,
  OPTIMISM_CHAIN_ID,
} from "@/lib/constants";
import { REWARD_TOKEN_SYMBOLS } from "@/lib/constants/daily-rewards-v2";

export type RewardChainCardProps = {
  chainId: number;
  name: string;
  fid: bigint | undefined;
  isConnected: boolean;
  address?: string;
  sponsored: boolean;
  onClaimSuccess?: () => void;
};

const DISPLAY_REWARD_AMOUNT = "0.01";

function getChainIconName(chainId: number): string {
  switch (chainId) {
    case BASE_CHAIN_ID:
      return "base";
    case CELO_CHAIN_ID:
      return "celo";
    case OPTIMISM_CHAIN_ID:
      return "optimism";
    default:
      return "base";
  }
}

function getTokenSymbol(chainId: number): string {
  return REWARD_TOKEN_SYMBOLS[chainId] || "USDC";
}

export const RewardChainCard = memo(
  ({
    chainId,
    name,
    fid,
    isConnected,
    address,
    sponsored,
    onClaimSuccess,
  }: RewardChainCardProps) => {
    const {
      isCorrectChain,
      claimState,
      isCheckingEligibility,
      dailyClaimCount,
      chainBtnClasses,
      handleSwitchChain,
      isSwitching,
    } = useRewardChainCardLogic({
      chainId,
      fid,
      isConnected,
      address,
    });

    const chainIconName = getChainIconName(chainId);
    const tokenSymbol = getTokenSymbol(chainId);
    const isEligible = claimState?.isEligible ?? false;

    return (
      <Item variant="outline">
        <ItemContent>
          <ItemMedia>
            {Icons[chainIconName as keyof typeof Icons]?.({
              className: "h-8 w-24 text-current",
              role: "img",
              "aria-label": `${name} wordmark`,
              focusable: false,
            })}
          </ItemMedia>
          <ItemDescription>
            Claim {DISPLAY_REWARD_AMOUNT} {tokenSymbol} on {name}
          </ItemDescription>
        </ItemContent>
        <ItemFooter className="flex-col gap-3">
          <div className="w-full space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Daily Claims</span>
              <span className="font-medium">{dailyClaimCount} / 250</span>
            </div>
            <div className="overflow-hidden rounded-full bg-secondary">
              <div
                className="h-2 bg-primary transition-all"
                style={{
                  width: `${Math.min((dailyClaimCount / 250) * 100, 100)}%`,
                }}
              />
            </div>
          </div>

          {!isCorrectChain && isConnected && (
            <Button
              aria-busy={isSwitching}
              className={`w-full ${chainBtnClasses}`}
              disabled={isSwitching}
              onClick={handleSwitchChain}
              size="sm"
            >
              {isSwitching ? "Switching..." : `Switch to ${name}`}
            </Button>
          )}

          {isCorrectChain && (
            <RewardClaimTransaction
              disabled={!isEligible}
              fid={fid}
              onSuccess={onClaimSuccess}
              sponsored={sponsored && chainId === BASE_CHAIN_ID}
            />
          )}

          {isCheckingEligibility && (
            <div className="flex items-center justify-center gap-2 py-2 text-muted-foreground text-xs">
              <div className="h-3 w-3 animate-spin rounded-full border border-primary border-t-transparent" />
              Checking eligibility
            </div>
          )}
        </ItemFooter>
      </Item>
    );
  }
);

RewardChainCard.displayName = "RewardChainCard";
