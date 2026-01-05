"use client";

import { GMChainCard } from "@/components/gm-chain-card/gm-chain-card";
import { BASE_CHAIN_ID, DAILY_GM_ADDRESS } from "@/lib/constants";
import { Countdown } from "./countdown";
import { useHomeLogic } from "./home/use-home-logic";

export const Home = ({ sponsored }: { sponsored?: boolean }) => {
  const { isConnected, address } = useHomeLogic();

  return (
    <div className="my-12 space-y-4">
      <Countdown />

      <GMChainCard
        address={address}
        chainId={BASE_CHAIN_ID}
        contractAddress={DAILY_GM_ADDRESS}
        isConnected={isConnected}
        isSponsored={sponsored}
        name="Base"
      />
    </div>
  );
};

Home.displayName = "Home";
