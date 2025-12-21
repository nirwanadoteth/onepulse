import { useGmStats } from "@/hooks/use-gm-stats";

type UseChainSlideLogicProps = {
  address?: string;
  onOpenModal: (refetch: () => Promise<unknown>) => void;
};

export function useChainSlideLogic({
  address,
  onOpenModal,
}: UseChainSlideLogicProps) {
  const { stats, isReady } = useGmStats(address);

  return {
    stats,
    isReady,
    handleOpenModal: onOpenModal,
  };
}
