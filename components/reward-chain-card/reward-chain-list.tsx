import { memo, useMemo } from "react";
import { useMiniAppContext } from "@/components/providers/miniapp-provider";
import {
  BASE_CHAIN_ID,
  CELO_CHAIN_ID,
  OPTIMISM_CHAIN_ID,
} from "@/lib/constants";
import { RewardChainCard } from "./reward-chain-card";

type RewardChainListProps = {
  fid: bigint | undefined;
  isConnected: boolean;
  address?: string;
  sponsored?: boolean;
  onClaimSuccess?: () => void;
};

const BASE_APP_CLIENT_FID = 309_857;

const ALL_CHAINS = [
  { id: BASE_CHAIN_ID, name: "Base" },
  { id: CELO_CHAIN_ID, name: "Celo" },
  { id: OPTIMISM_CHAIN_ID, name: "Optimism" },
];

export const RewardChainList = memo(
  ({
    fid,
    isConnected,
    address,
    sponsored = false,
    onClaimSuccess,
  }: RewardChainListProps) => {
    const miniAppContext = useMiniAppContext();
    const isBaseApp =
      miniAppContext?.context?.client?.clientFid === BASE_APP_CLIENT_FID;

    const chainInfo = useMemo(
      () =>
        isBaseApp
          ? ALL_CHAINS.filter((c) => c.id !== CELO_CHAIN_ID)
          : ALL_CHAINS,
      [isBaseApp]
    );

    return (
      <div className="space-y-4">
        {chainInfo.map((chain) => (
          <RewardChainCard
            address={address}
            chainId={chain.id}
            fid={fid}
            isConnected={isConnected}
            key={chain.id}
            name={chain.name}
            onClaimSuccess={onClaimSuccess}
            sponsored={sponsored}
          />
        ))}
      </div>
    );
  }
);

RewardChainList.displayName = "RewardChainList";
