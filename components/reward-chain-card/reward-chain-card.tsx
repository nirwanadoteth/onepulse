"use client";

import { useOpenUrl } from "@coinbase/onchainkit/minikit";
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
import { useGMSharing } from "@/hooks/use-gm-sharing";
import { useGmStats } from "@/hooks/use-gm-stats";
import { useMiniAppSharing } from "@/hooks/use-mini-app-sharing";
import { useShareActions } from "@/hooks/use-share-actions";
import type { ChainId } from "@/lib/constants";

export type RewardChainCardProps = {
  chainId: ChainId;
  name: string;
  fid: bigint | undefined;
  isConnected: boolean;
  address?: string;
  sponsored: boolean;
};

export function RewardChainCard(props: RewardChainCardProps) {
  const { chainId, name, fid, isConnected, address, sponsored } = props;
  const { copyToClipboard } = useCopyToClipboard({
    onCopyAction: () => toast.success("Copied to clipboard"),
  });

  const {
    claimState,
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
    isCorrectChain,
  } = useRewardChainCardLogic({
    chainId,
    fid,
    isConnected,
    address,
  });

  const { hasSharedToday, markAsShared } = useMiniAppSharing();

  // Now that claimState is available, get stats and sharing logic
  const { stats } = useGmStats(address);
  const claimedToday = Boolean(hasAlreadyClaimed);
  const completedAllChains = address
    ? Object.values(stats).every((s) => s.currentStreak > 0)
    : false;
  const { shareText, shareUrl } = useGMSharing(
    claimedToday,
    completedAllChains
  );
  const { shareToCast } = useShareActions();

  const openUrl = useOpenUrl();
  const isEligible = claimState?.isEligible ?? false;
  const BASE_CHAIN_ID = 8453;

  const handleClaimSuccess = (txHash: string) => {
    toast.success(`Reward claimed on ${name}!`, {
      action: createSuccessAction(txHash, chainId, openUrl),
    });
  };

  const handleClaimError = (error: Error) => {
    toast.error(`Failed to claim reward on ${name}`, {
      description: error.message || "Please try again later",
    });
  };

  const handleShareMiniApp = async () => {
    if (!shareUrl) {
      toast.error("Unable to generate share link. Please try again.");
      return;
    }
    const success = await shareToCast(shareText, shareUrl);
    if (success) {
      toast.success("Mini app shared successfully!");
      markAsShared();
    } else {
      toast.error("Failed to share mini app. Please try again.");
    }
  };

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
        <div className="flex flex-col items-end gap-1">
          <span className="font-medium text-lg tracking-tight">
            {displayRewardAmount}
          </span>
          {tokenAddress && (
            <Button
              aria-label={`Copy ${tokenSymbol} contract address`}
              className="h-auto p-0 font-medium text-muted-foreground text-xs underline underline-offset-1 hover:text-primary"
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

        {(() => {
          if (isConnected && hasAlreadyClaimed) {
            return (
              <Button
                className={`w-full ${chainBtnClasses}`}
                disabled={true}
                size="lg"
              >
                {buttonState?.label || "Already claimed"}
              </Button>
            );
          }

          if (!hasSharedToday) {
            return (
              <Button
                className={`w-full ${chainBtnClasses}`}
                onClick={handleShareMiniApp}
                size="lg"
              >
                Share Mini App
              </Button>
            );
          }

          return (
            <RewardClaimTransaction
              chainId={chainId}
              className={chainBtnClasses}
              disabled={!isEligible}
              fid={fid}
              handleSwitchChain={handleSwitchChain}
              isCorrectChain={isCorrectChain}
              onError={handleClaimError}
              onSuccess={handleClaimSuccess}
              sponsored={sponsored && chainId === BASE_CHAIN_ID}
            />
          );
        })()}
      </ItemFooter>
    </Item>
  );
}
