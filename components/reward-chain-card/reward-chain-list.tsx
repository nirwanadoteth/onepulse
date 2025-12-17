import { memo } from "react";
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

const CHAIN_INFO = [
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
  }: RewardChainListProps) => (
    <div className="space-y-4">
      {CHAIN_INFO.map((chain) => (
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
  )
);

RewardChainList.displayName = "RewardChainList";
