import { useAppKitAccount } from "@reown/appkit/react";
import { useEffect, useMemo, useState } from "react";
import type { useGmStats } from "@/hooks/use-gm-stats";
import {
  areAllChainsComplete,
  getChainList,
  getNextTargetSec,
} from "./chain-config";
import { useCongratsLogic } from "./use-congrats-logic";
import { useHomeStats } from "./use-home-stats";
import { useLastCongratsDay } from "./use-last-congrats-day";
import { useModalManagement } from "./use-modal-management";
import { usePerChainStatus } from "./use-per-chain-status";

type UseHomeLogicProps = {
  allowedChainIds?: number[];
  onGmStatsChange?: (stats: ReturnType<typeof useGmStats>) => void;
  onAllDoneChange?: (allDone: boolean) => void;
};

export const useHomeLogic = ({
  allowedChainIds,
  onGmStatsChange,
  onAllDoneChange,
}: UseHomeLogicProps) => {
  const { isConnected, address } = useAppKitAccount({ namespace: "eip155" });
  const {
    activeModalChainId,
    processing,
    setActiveModalChainId,
    setProcessing,
  } = useModalManagement();

  const [activeRefetchFn, setActiveRefetchFn] = useState<
    (() => Promise<unknown>) | undefined
  >(undefined);

  const chains = useMemo(
    () => getChainList(allowedChainIds),
    [allowedChainIds]
  );
  const chainIds = useMemo(() => chains.map((c) => c.id), [chains]);

  const gmStatsResult = useHomeStats(address, chains, onGmStatsChange);

  const { statusMap, handleStatus } = usePerChainStatus();

  const allDone = useMemo(
    () => areAllChainsComplete(chainIds, statusMap),
    [chainIds, statusMap]
  );

  useEffect(() => {
    onAllDoneChange?.(allDone);
  }, [allDone, onAllDoneChange]);

  const nextTargetSec = useMemo(
    () => getNextTargetSec(chainIds, statusMap),
    [chainIds, statusMap]
  );

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
    nextTargetSec,
    showCongrats,
    setShowCongrats,
  };
};
