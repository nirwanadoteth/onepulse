"use client";

import { memo, useCallback } from "react";
import type { useGmStats } from "@/hooks/use-gm-stats";
import { minikitConfig } from "@/minikit.config";
import { ChainList } from "./home/chain-list";
import { CongratsDialog } from "./home/congrats-dialog";
import { ModalRenderer } from "./home/modal-renderer";
import { useHomeLogic } from "./home/use-home-logic";

export const Home = memo(
  ({
    sponsored,
    allowedChainIds,
    onGmStatsChange,
    onShareClick,
    onAllDoneChange,
  }: {
    sponsored?: boolean;
    allowedChainIds?: number[];
    onGmStatsChange?: (stats: ReturnType<typeof useGmStats>) => void;
    onShareClick?: () => void;
    onAllDoneChange?: (allDone: boolean) => void;
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
      nextTargetSec,
      showCongrats,
      setShowCongrats,
    } = useHomeLogic({
      allowedChainIds,
      onGmStatsChange,
      onAllDoneChange,
    });

    const handleModalClose = useCallback(
      () => setActiveModalChainId(null),
      [setActiveModalChainId]
    );

    return (
      <div className="my-12 space-y-4">
        <div className="space-y-2">
          <h2 className="font-semibold text-lg">Daily GM</h2>
          <p className="text-muted-foreground text-sm">
            {minikitConfig.miniapp.subtitle}
          </p>
        </div>

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
          gmStats={gmStatsResult?.stats}
          nextTargetSec={nextTargetSec}
          onOpenChange={setShowCongrats}
          onShare={onShareClick}
          open={showCongrats}
        />
      </div>
    );
  }
);

Home.displayName = "Home";
