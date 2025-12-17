"use client";

import { memo } from "react";
import { RewardCard as DailyRewardCard } from "./reward-card/reward-card";
import {
  DepletedVaultCard,
  DisconnectedCard,
  WrongNetworkCard,
} from "./reward-card/status-cards";
import { useRewardCard } from "./reward-card/use-reward-card";

type RewardCardProps = {
  fid: bigint | undefined;
  sponsored: boolean;
};

export const RewardCard = memo(({ fid, sponsored }: RewardCardProps) => {
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
    multichainCounts,
  } = useRewardCard({ fid, sponsored });

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
    <DailyRewardCard
      address={address}
      chainId={numericChainId}
      dailyClaimsCount={dailyClaimsCount}
      fid={fid}
      hasClaimedToday={hasClaimedToday}
      isCheckingEligibility={isCheckingEligibility}
      isShareModalOpen={isShareModalOpen}
      multichainCounts={multichainCounts}
      onClaimSuccessAction={handleClaimSuccess}
      onShareModalCloseAction={() => setIsShareModalOpen(false)}
      sponsored={isSponsored}
      state={claimState}
    />
  );
});
RewardCard.displayName = "RewardCard";
