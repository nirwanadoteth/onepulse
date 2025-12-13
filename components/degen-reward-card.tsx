"use client";

import { memo } from "react";

import { RewardCard } from "./degen-reward-card/reward-card";
import {
  DepletedVaultCard,
  DisconnectedCard,
  WrongNetworkCard,
} from "./degen-reward-card/status-cards";
import { useDegenRewardCard } from "./degen-reward-card/use-degen-reward-card";

type DegenRewardCardProps = {
  fid: bigint | undefined;
  sponsored: boolean;
};

export const DegenRewardCard = memo(
  ({ fid, sponsored }: DegenRewardCardProps) => {
    const {
      isShareModalOpen,
      setIsShareModalOpen,
      address,
      numericChainId,
      hasClaimedToday,
      isCheckingEligibility,
      handleClaimSuccess,
      isSponsored,
      claimState,
      isWrongNetwork,
      isDisconnected,
      hasRewards,
      dailyClaimsCount,
    } = useDegenRewardCard({ fid, sponsored });

    if (isDisconnected) {
      return <DisconnectedCard />;
    }

    if (isWrongNetwork) {
      return <WrongNetworkCard />;
    }

    if (!hasRewards) {
      return <DepletedVaultCard />;
    }

    return (
      <RewardCard
        address={address}
        chainId={numericChainId}
        dailyClaimsCount={dailyClaimsCount}
        fid={fid}
        hasClaimedToday={hasClaimedToday}
        isCheckingEligibility={isCheckingEligibility}
        isShareModalOpen={isShareModalOpen}
        onClaimSuccessAction={handleClaimSuccess}
        onShareModalCloseAction={() => setIsShareModalOpen(false)}
        sponsored={isSponsored}
        state={claimState}
      />
    );
  }
);
DegenRewardCard.displayName = "DegenRewardCard";
