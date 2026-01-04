"use client";

import dynamic from "next/dynamic";
import type { useGmStats } from "@/hooks/use-gm-stats";
import type { ChainId } from "@/lib/constants";
import { Countdown } from "./countdown";
import { ChainList } from "./home/chain-list";
import { ModalRenderer } from "./home/modal-renderer";
import { useHomeLogic } from "./home/use-home-logic";

const CongratsDialog = dynamic(
  () =>
    import("./home/congrats-dialog").then((mod) => mod.CongratsDialog),
  { ssr: false }
);

export const Home = ({
  sponsored,
  allowedChainIds,
  onGmStatsChangeAction,
  onShareClickAction,
  onAllDoneChangeAction,
}: {
  sponsored?: boolean;
  allowedChainIds?: ChainId[];
  onGmStatsChangeAction?: (stats: ReturnType<typeof useGmStats>) => void;
  onShareClickAction?: () => void;
  onAllDoneChangeAction?: (allDone: boolean) => void;
}) => {
  const {
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
    showCongrats,
    setShowCongrats,
  } = useHomeLogic({
    allowedChainIds,
    onGmStatsChange: onGmStatsChangeAction,
    onAllDoneChange: onAllDoneChangeAction,
  });

  const handleModalClose = () => setActiveModalChainId(null);

  return (
    <div className="my-12 space-y-4">
      <Countdown />

      <ChainList
        address={address}
        chains={chains}
        handleStatus={handleStatus}
        isConnected={isConnected}
        setActiveModalChainId={setActiveModalChainId}
        setActiveRefetchFn={setActiveRefetchFn}
      />

      <ModalRenderer
        activeModalChainId={activeModalChainId}
        address={address}
        chains={chains}
        onClose={handleModalClose}
        processing={processing}
        refetchLastGmDay={activeRefetchFn}
        setProcessing={setProcessing}
        sponsored={Boolean(sponsored)}
      />

      <CongratsDialog
        isStatsReady={gmStatsResult?.isReady}
        onOpenChangeAction={setShowCongrats}
        onShareClickAction={onShareClickAction}
        open={showCongrats}
      />
    </div>
  );
};

Home.displayName = "Home";
