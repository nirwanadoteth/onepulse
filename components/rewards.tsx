"use client";

import { memo } from "react";
import { ConnectWalletCard } from "@/components/connect-wallet-card";
import { DegenRewardCard } from "@/components/degen-reward-card";
import { MiniAppRequiredCard } from "@/components/mini-app-required-card";
import { VaultBalanceCard } from "@/components/vault-balance-card";
import { useRewardsLogic } from "./rewards/use-rewards-logic";

export const Rewards = memo(function GMBase({
  sponsored,
}: {
  sponsored?: boolean;
}) {
  const { isConnected, fid } = useRewardsLogic();

  return (
    <div className="my-12 space-y-4">
      <VaultBalanceCard />

      {isConnected ? (
        fid ? (
          <DegenRewardCard fid={fid} sponsored={Boolean(sponsored)} />
        ) : (
          <MiniAppRequiredCard />
        )
      ) : (
        <ConnectWalletCard />
      )}
    </div>
  );
});
