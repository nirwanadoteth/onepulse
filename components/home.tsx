"use client";

import { GMChainCard } from "@/components/gm-chain-card/gm-chain-card";
import { Countdown } from "./countdown";
import { useHomeLogic } from "./home/use-home-logic";

type HomeProps = {
  sponsored?: boolean;
};

export function Home({ sponsored }: HomeProps) {
  const { isConnected, address } = useHomeLogic();

  return (
    <div className="my-12 space-y-4">
      <Countdown />

      <GMChainCard
        address={address}
        isConnected={isConnected}
        isSponsored={sponsored}
      />
    </div>
  );
}

Home.displayName = "Home";
