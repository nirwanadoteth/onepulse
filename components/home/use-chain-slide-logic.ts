import { useCallback } from "react";
import { useGmStats } from "@/hooks/use-gm-stats";

type UseChainSlideLogicProps = {
  address?: string;
  chainId: number;
  onOpenModal: (refetch: () => Promise<unknown>) => void;
};

export function useChainSlideLogic({
  address,
  chainId,
  onOpenModal,
}: UseChainSlideLogicProps) {
  const { stats, isReady } = useGmStats(address, chainId);

  const handleOpenModal = useCallback(
    (refetch: () => Promise<unknown>) => {
      onOpenModal(refetch);
    },
    [onOpenModal]
  );

  return {
    stats,
    isReady,
    handleOpenModal,
  };
}
