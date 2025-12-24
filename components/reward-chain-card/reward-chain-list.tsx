import { memo, useMemo } from "react";
import { useMiniAppContext } from "@/components/providers/miniapp-provider";
import { useHiddenChains } from "@/hooks/use-hidden-chains";
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
};

const BASE_APP_CLIENT_FID = 309_857;

const ALL_CHAINS = [
  { id: BASE_CHAIN_ID, name: "Base" },
  { id: CELO_CHAIN_ID, name: "Celo" },
  { id: OPTIMISM_CHAIN_ID, name: "Optimism" },
];

export const RewardChainList = memo(
  ({ fid, isConnected, address, sponsored = false }: RewardChainListProps) => {
    const miniAppContext = useMiniAppContext();
    const isBaseApp =
      miniAppContext?.context?.client?.clientFid === BASE_APP_CLIENT_FID;

    const { data: hiddenChains = [] } = useHiddenChains();

    const chainInfo = useMemo(() => {
      let chains = isBaseApp
        ? ALL_CHAINS.filter((c) => c.id !== CELO_CHAIN_ID)
        : ALL_CHAINS;

      // Filter out hidden chains
      chains = chains.filter((c) => !hiddenChains.includes(c.id));

      return chains;
    }, [isBaseApp, hiddenChains]);

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
            sponsored={sponsored}
          />
        ))}
      </div>
    );
  }
);

RewardChainList.displayName = "RewardChainList";
