"use client";

import { RewardChainList } from "@/components/reward-chain-card/reward-chain-list";
import { useRewardsLogic } from "./rewards/use-rewards-logic";
import { ConnectWallet } from "./wallet";

export const Rewards = function RewardsTab({
  sponsored,
}: {
  sponsored?: boolean;
}) {
  const { isConnected, fid, address } = useRewardsLogic();

  return (
    <div className="my-12 space-y-4">
      {isConnected ? (
        <RewardChainList
          address={address}
          fid={fid}
          isConnected={isConnected}
          sponsored={Boolean(sponsored)}
        />
      ) : (
        <ConnectWallet />
      )}
    </div>
  );
};
