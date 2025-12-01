"use client";

import { memo } from "react";
import { GMChainCard } from "@/components/gm-chain-card/gm-chain-card";
import { useChainSlideLogic } from "./use-chain-slide-logic";

type ChainSlideProps = {
  chainId: number;
  chainName: string;
  contractAddress: `0x${string}`;
  isConnected: boolean;
  address?: string;
  onStatusChange: (status: {
    chainId: number;
    hasGmToday: boolean;
    targetSec: number;
  }) => void;
  onOpenModal: (refetch: () => Promise<unknown>) => void;
};

export const ChainSlide = memo(
  ({
    chainId,
    chainName,
    contractAddress,
    isConnected,
    address,
    onStatusChange,
    onOpenModal,
  }: ChainSlideProps) => {
    const { stats, isReady, handleOpenModal } = useChainSlideLogic({
      address,
      chainId,
      onOpenModal,
    });

    return (
      <GMChainCard
        address={address}
        chainId={chainId}
        contractAddress={contractAddress}
        isConnected={isConnected}
        isStatsReady={isReady}
        name={chainName}
        onOpenModal={handleOpenModal}
        onStatusChange={onStatusChange}
        stats={stats}
      />
    );
  }
);

ChainSlide.displayName = "ChainSlide";
