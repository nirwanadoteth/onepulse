import { useEffect, useState } from "react";
import { useConnection } from "wagmi";
import type { useGmStats } from "@/hooks/use-gm-stats";
import type { ChainId } from "@/lib/constants";
import { areAllChainsComplete, getChainList } from "./chain-config";
import { useCongratsLogic } from "./use-congrats-logic";
import { useHomeStats } from "./use-home-stats";
import { useLastCongratsDay } from "./use-last-congrats-day";
import { useModalManagement } from "./use-modal-management";
import { usePerChainStatus } from "./use-per-chain-status";

type UseHomeLogicProps = {
  allowedChainIds?: ChainId[];
  onGmStatsChange?: (stats: ReturnType<typeof useGmStats>) => void;
  onAllDoneChange?: (allDone: boolean) => void;
};

export const useHomeLogic = ({
  allowedChainIds,
  onGmStatsChange,
  onAllDoneChange,
}: UseHomeLogicProps) => {
  const { isConnected, address } = useConnection();
  const {
    activeModalChainId,
    processing,
    setActiveModalChainId,
    setProcessing,
  } = useModalManagement();

  const [activeRefetchFn, setActiveRefetchFn] = useState<
    (() => Promise<unknown>) | undefined
  >(undefined);

  const chains = getChainList(allowedChainIds);
  const chainIds = chains.map((c) => c.id);

  const gmStatsResult = useHomeStats(address, chains, onGmStatsChange);

  const { statusMap, handleStatus } = usePerChainStatus();

  const allDone = areAllChainsComplete(chainIds, statusMap);

  useEffect(() => {
    onAllDoneChange?.(allDone);
  }, [allDone, onAllDoneChange]);

  const { lastCongratsDay, setLastCongratsDay } = useLastCongratsDay();

  const { showCongrats, setShowCongrats } = useCongratsLogic({
    allDone,
    isConnected: Boolean(isConnected),
    lastCongratsDay,
    onLastCongratsDayUpdateAction: setLastCongratsDay,
  });

  return {
    isConnected,
    address,
    activeModalChainId,
    processing,
    setActiveModalChainId,
    setProcessing,
    activeRefetchFn,
    setActiveRefetchFn,
    chains,
    gmStatsResult,
    handleStatus,
    allDone,
    showCongrats,
    setShowCongrats,
  };
};
