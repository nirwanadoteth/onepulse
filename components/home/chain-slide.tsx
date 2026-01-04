import { GMChainCard } from "@/components/gm-chain-card/gm-chain-card";
import type { ChainId } from "@/lib/constants";
import { useChainSlideLogic } from "./use-chain-slide-logic";

type ChainSlideProps = {
  chainId: ChainId;
  chainName: string;
  contractAddress: `0x${string}`;
  isConnected: boolean;
  address?: `0x${string}`;
  onStatusChange: (status: { chainId: ChainId; hasGmToday: boolean }) => void;
  onOpenModal: (refetch: () => Promise<unknown>) => void;
};

export function ChainSlide({
  chainId,
  chainName,
  contractAddress,
  isConnected,
  address,
  onStatusChange,
  onOpenModal,
}: ChainSlideProps) {
  const { stats, isReady, handleOpenModal } = useChainSlideLogic({
    address,
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
      onOpenModalAction={handleOpenModal}
      onStatusChangeAction={onStatusChange}
      stats={stats}
    />
  );
}
