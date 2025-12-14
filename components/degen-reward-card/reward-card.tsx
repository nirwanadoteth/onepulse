"use client";

import { DegenClaimTransaction } from "@/components/gm-chain-card/degen-claim-transaction";
import { ShareModal } from "@/components/share-modal";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DAILY_CLAIM_LIMIT } from "@/lib/constants";
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
};

const DEGEN_DECIMALS = 18n;

const DEGEN_SCALING_FACTOR = 10n ** DEGEN_DECIMALS;

export function RewardCard({
  fid,
  sponsored,
  state,
  isCheckingEligibility,
  hasClaimedToday,
  isShareModalOpen,
  onClaimSuccessAction,
  onShareModalCloseAction,
  dailyClaimsCount,
}: RewardCardProps) {
  const config = getStatusConfig(state);
  const progressPercentage = Math.min(
    (dailyClaimsCount / DAILY_CLAIM_LIMIT) * 100,
    100
  );

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
            {!isCheckingEligibility && state.reward > 0n && (
              <div className="text-right">
                <div className="font-light text-3xl tracking-tight">
                  {(state.reward / DEGEN_SCALING_FACTOR).toString()}
                </div>
                <div className="text-muted-foreground text-xs uppercase tracking-wider">
                  DEGEN
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Daily Claims Limit</span>
              <span className="font-medium">
                {dailyClaimsCount} / {DAILY_CLAIM_LIMIT}
              </span>
            </div>
            <Progress className="h-2" value={progressPercentage} />
          </div>

          <DegenClaimTransaction
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
        description="You've claimed your daily DEGEN rewards! Share your achievement with the community."
        onOpenChange={onShareModalCloseAction}
        open={isShareModalOpen}
        title="Rewards Claimed! 🎉"
      />
    </>
  );
}
