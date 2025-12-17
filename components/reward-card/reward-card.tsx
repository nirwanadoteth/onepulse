"use client";

import { ShareModal } from "@/components/share-modal";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DAILY_CLAIM_LIMIT } from "@/lib/constants";
import { REWARD_TOKEN_SYMBOLS } from "@/lib/constants/daily-rewards-v2";
import { RewardClaimTransaction } from "../gm-chain-card/reward-claim-transaction";
import { type ClaimState, getStatusConfig } from "./utils";

type RewardCardProps = {
  fid: bigint | undefined;
  sponsored: boolean;
  state: ClaimState;
  isCheckingEligibility: boolean;
  hasClaimedToday: boolean;
  isShareModalOpen: boolean;
  onClaimSuccessAction: () => void;
  onShareModalCloseAction: () => void;
  address: string | undefined;
  chainId: number | undefined;
  dailyClaimsCount: number;
  multichainCounts?: {
    base: number;
    celo: number;
    optimism: number;
    total: number;
  };
};

const DISPLAY_REWARD_AMOUNT = "0.01";

function getTokenSymbol(chainId: number | undefined): string {
  if (!chainId) {
    return "USDC";
  }
  return REWARD_TOKEN_SYMBOLS[chainId] || "USDC";
}

export function RewardCard({
  fid,
  sponsored,
  state,
  isCheckingEligibility,
  hasClaimedToday,
  isShareModalOpen,
  onClaimSuccessAction,
  onShareModalCloseAction,
  chainId,
  dailyClaimsCount,
  multichainCounts,
}: RewardCardProps) {
  const config = getStatusConfig(state);
  const progressPercentage = Math.min(
    (dailyClaimsCount / DAILY_CLAIM_LIMIT) * 100,
    100
  );
  const totalPercentage = multichainCounts
    ? Math.min((multichainCounts.total / (DAILY_CLAIM_LIMIT * 3)) * 100, 100)
    : progressPercentage;
  const tokenSymbol = getTokenSymbol(chainId);

  return (
    <>
      <Card className="border-border/50">
        <CardHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className={`font-semibold text-xl ${config.accentColor}`}>
                {config.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {config.description}
              </p>
            </div>
            {!isCheckingEligibility && state.isEligible && (
              <div className="text-right">
                <div className="font-light text-3xl tracking-tight">
                  {DISPLAY_REWARD_AMOUNT}
                </div>
                <div className="text-muted-foreground text-xs uppercase tracking-wider">
                  {tokenSymbol}
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">
                This Chain Daily Limit
              </span>
              <span className="font-medium">
                {dailyClaimsCount} / {DAILY_CLAIM_LIMIT}
              </span>
            </div>
            <Progress className="h-2" value={progressPercentage} />
          </div>

          {multichainCounts && (
            <div className="space-y-2 border-border/50 border-t pt-3">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Multichain Total</span>
                <span className="font-medium">
                  {multichainCounts.total} / {DAILY_CLAIM_LIMIT * 3}
                </span>
              </div>
              <Progress className="h-2" value={totalPercentage} />
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="font-medium text-foreground">
                    {multichainCounts.base}
                  </div>
                  <div className="text-muted-foreground">Base</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-foreground">
                    {multichainCounts.celo}
                  </div>
                  <div className="text-muted-foreground">Celo</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-foreground">
                    {multichainCounts.optimism}
                  </div>
                  <div className="text-muted-foreground">Optimism</div>
                </div>
              </div>
            </div>
          )}

          <RewardClaimTransaction
            disabled={!state.isEligible}
            fid={fid}
            onSuccess={onClaimSuccessAction}
            sponsored={sponsored}
          />

          {isCheckingEligibility && (
            <div className="mt-4 flex items-center gap-2 text-muted-foreground text-xs">
              <div className="h-3 w-3 animate-spin rounded-full border border-primary border-t-transparent" />
              Checking eligibility
            </div>
          )}
        </CardContent>
      </Card>

      <ShareModal
        claimedToday={hasClaimedToday}
        description="You've claimed your daily rewards! Share your achievement with the community."
        onOpenChange={onShareModalCloseAction}
        open={isShareModalOpen}
        title="Rewards Claimed! 🎉"
      />
    </>
  );
}
