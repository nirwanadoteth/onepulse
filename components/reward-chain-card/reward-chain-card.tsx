"use client";

import { useOpenUrl } from "@coinbase/onchainkit/minikit";
import { memo, useCallback } from "react";
import { toast } from "sonner";
import { RewardClaimTransaction } from "@/components/gm-chain-card/reward-claim-transaction";
import { Icons } from "@/components/icons";
import { useRewardChainCardLogic } from "@/components/reward-chain-card/use-reward-chain-card-logic";
import { createSuccessAction } from "@/components/transaction-toast/utils";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemFooter,
  ItemMedia,
} from "@/components/ui/item";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

export type RewardChainCardProps = {
  chainId: number;
  name: string;
  fid: bigint | undefined;
  isConnected: boolean;
  address?: string;
  sponsored: boolean;
};

export const RewardChainCard = memo((props: RewardChainCardProps) => {
  const { chainId, name, fid, isConnected, address, sponsored } = props;
  const { copyToClipboard } = useCopyToClipboard({
    onCopyAction: () => toast.success("Copied to clipboard"),
  });
  const {
    isCorrectChain,
    claimState,
    isCheckingEligibility,
    dailyClaimCount,
    chainBtnClasses,
    handleSwitchChain,
    buttonState,
    hasAlreadyClaimed,
    chainIconName,
    tokenSymbol,
    tokenAddress,
    displayRewardAmount,
    claimLimitDisplay,
  } = useRewardChainCardLogic({
    chainId,
    fid,
    isConnected,
    address,
  });

  const openUrl = useOpenUrl();
  const isEligible = claimState?.isEligible ?? false;
  const BASE_CHAIN_ID = 8453;

  const handleClaimSuccess = useCallback(
    (txHash: string) => {
      toast.success(`Reward claimed on ${name}!`, {
        action: createSuccessAction(txHash, chainId, openUrl),
      });
    },
    [name, chainId, openUrl]
  );

  const handleClaimError = useCallback(
    (error: Error) => {
      toast.error(`Failed to claim reward on ${name}`, {
        description: error.message || "Please try again later",
      });
    },
    [name]
  );

  return (
    <Item variant="outline">
      <ItemContent className="items-start">
        <ItemMedia>
          {Icons[chainIconName as keyof typeof Icons]?.({
            className: "h-8 w-24 text-current",
            role: "img",
            "aria-label": `${name} wordmark`,
            focusable: false,
          })}
        </ItemMedia>
      </ItemContent>
      <ItemActions>
        <div className="flex items-center gap-2">
          <span className="font-medium text-lg tracking-tight">
            {displayRewardAmount}
          </span>
          {tokenAddress && (
            <Button
              aria-label="Copy CA"
              className="mr-2 ml-1 h-4 w-4 text-accent-foreground text-lg underline underline-offset-2 hover:text-primary"
              onClick={() => copyToClipboard(tokenAddress)}
              variant="link"
            >
              {tokenSymbol}
            </Button>
          )}
        </div>
      </ItemActions>
      <ItemFooter className="flex-col gap-3">
        <div className="w-full space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Daily Claims</span>
            <span className="font-medium">
              {dailyClaimCount} / {claimLimitDisplay}
            </span>
          </div>
          <div className="overflow-hidden rounded-full bg-secondary">
            <div
              className="h-2 bg-primary transition-all"
              style={{
                width: `${Math.min(
                  (dailyClaimCount / claimLimitDisplay) * 100,
                  100
                )}%`,
              }}
            />
          </div>
        </div>

        {isConnected && hasAlreadyClaimed ? (
          <Button
            className={`w-full ${chainBtnClasses}`}
            disabled={true}
            size="lg"
          >
            {buttonState?.label || "Already claimed"}
          </Button>
        ) : (
          <RewardClaimTransaction
            className={chainBtnClasses}
            disabled={!(isEligible && isCheckingEligibility)}
            fid={fid}
            handleSwitchChain={handleSwitchChain}
            isCorrectChain={isCorrectChain}
            onError={handleClaimError}
            onSuccess={handleClaimSuccess}
            sponsored={sponsored && chainId === BASE_CHAIN_ID}
          />
        )}
      </ItemFooter>
    </Item>
  );
});

RewardChainCard.displayName = "RewardChainCard";
