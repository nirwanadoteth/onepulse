"use client";

import { memo } from "react";
import { ConnectWalletCard } from "@/components/connect-wallet-card";
import { MiniAppRequiredCard } from "@/components/mini-app-required-card";
import { RewardChainList } from "@/components/reward-chain-card/reward-chain-list";
import { useRewardsLogic } from "./rewards/use-rewards-logic";

export const Rewards = memo(function RewardsTab({
  sponsored,
}: {
  sponsored?: boolean;
}) {
  const { isConnected, fid, address } = useRewardsLogic();

  return (
    <div className="my-12 space-y-4">
      {isConnected ? (
        fid ? (
          <RewardChainList
            address={address}
            fid={fid}
            isConnected
            sponsored={Boolean(sponsored)}
          />
        ) : (
          <MiniAppRequiredCard />
        )
      ) : (
        <ConnectWalletCard />
      )}
    </div>
  );
});
