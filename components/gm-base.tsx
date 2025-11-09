"use client";

import React, { useMemo } from "react";
import { useAccount } from "wagmi";
import { GMChainCard } from "@/components/gm-chain-card/gm-chain-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useGmStats } from "@/hooks/use-gm-stats";
import { DAILY_GM_ADDRESSES } from "@/lib/constants";

import {
  areAllChainsComplete,
  getChainList,
  getNextTargetSec,
} from "./gm-base/chain-config";
import { CongratsDialog } from "./gm-base/congrats-dialog";
import { ModalRenderer } from "./gm-base/modal-renderer";
import { useConfettiControl } from "./gm-base/use-confetti-control";
import { useCongratsLogic } from "./gm-base/use-congrats-logic";
import { useLastCongratsDay } from "./gm-base/use-last-congrats-day";
import { useModalManagement } from "./gm-base/use-modal-management";
import { usePerChainStatus } from "./gm-base/use-per-chain-status";
import { minikitConfig } from "@/minikit.config";

export const GMBase = React.memo(
  ({
    sponsored,
    allowedChainIds,
  }: {
    sponsored?: boolean;
    allowedChainIds?: number[];
  }) => {
    const { isConnected, address } = useAccount();
    const {
      activeModalChainId,
      processing,
      setActiveModalChainId,
      setProcessing,
    } = useModalManagement();

    // Store refetch function for active chain
    const [activeRefetchFn, setActiveRefetchFn] = React.useState<
      (() => Promise<unknown>) | undefined
    >(undefined);

    const chains = useMemo(
      () => getChainList(allowedChainIds),
      [allowedChainIds]
    );
    const chainIds = useMemo(() => chains.map((c) => c.id), [chains]);

    // Track per-chain status
    const { statusMap, handleStatus } = usePerChainStatus();

    // Derive all-done and next target from chain status
    const allDone = useMemo(
      () => areAllChainsComplete(chainIds, statusMap),
      [chainIds, statusMap]
    );

    const nextTargetSec = useMemo(
      () => getNextTargetSec(chainIds, statusMap),
      [chainIds, statusMap]
    );

    // Manage congratulations day persistently
    const { lastCongratsDay, setLastCongratsDay } = useLastCongratsDay();

    const { confettiRef } = useConfettiControl(false, isConnected);

    const { showCongrats, setShowCongrats } = useCongratsLogic({
      allDone,
      isConnected,
      lastCongratsDay,
      onLastCongratsDayUpdate: setLastCongratsDay,
    });

    // Update confetti trigger when showing congrats
    React.useEffect(() => {
      if (showCongrats) {
        confettiRef.current?.fire?.();
      }
    }, [showCongrats, confettiRef]);

    return (
      <div className="mt-4 space-y-4">
        <div className="space-y-2">
          <h2 className="font-semibold text-lg">Daily GM</h2>
          <p className="text-muted-foreground text-sm">
            {minikitConfig.miniapp.description}
          </p>
        </div>

        <Carousel
          className="w-full"
          opts={{
            align: "start",
            loop: true,
          }}
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {chains.map((c) => {
              const contractAddress = DAILY_GM_ADDRESSES[c.id];
              return contractAddress ? (
                <CarouselItem className="basis-full pl-2 md:pl-4" key={c.id}>
                  <ChainSlide
                    address={address}
                    chainId={c.id}
                    chainName={c.name}
                    contractAddress={contractAddress}
                    isConnected={Boolean(isConnected)}
                    onOpenModal={(refetch) => {
                      setActiveModalChainId(c.id);
                      setActiveRefetchFn(() => refetch);
                    }}
                    onStatusChange={handleStatus}
                    sponsored={Boolean(sponsored) && c.id === 8453}
                  />
                </CarouselItem>
              ) : null;
            })}
          </CarouselContent>
        </Carousel>

        {/* Global modal rendered at root level */}
        <ModalRenderer
          activeModalChainId={activeModalChainId}
          address={address}
          chains={chains}
          onClose={() => {
            setActiveModalChainId(null);
            setProcessing(false);
          }}
          processing={processing}
          refetchLastGmDay={activeRefetchFn}
          setProcessing={setProcessing}
          sponsored={Boolean(sponsored)}
        />

        <CongratsDialog
          confettiRef={confettiRef}
          nextTargetSec={nextTargetSec}
          onOpenChange={(val) => {
            if (!val) {
              setShowCongrats(false);
            }
          }}
          open={Boolean(showCongrats && allDone)}
        />
      </div>
    );
  }
);

// Separate component to handle per-chain stats
const ChainSlide = React.memo(
  ({
    chainId,
    chainName,
    contractAddress,
    isConnected,
    address,
    sponsored,
    onStatusChange,
    onOpenModal,
  }: {
    chainId: number;
    chainName: string;
    contractAddress: `0x${string}`;
    isConnected: boolean;
    address?: string;
    sponsored: boolean;
    onStatusChange: (status: {
      chainId: number;
      hasGmToday: boolean;
      targetSec: number;
    }) => void;
    onOpenModal: (refetch: () => Promise<unknown>) => void;
  }) => {
    const { stats, isReady } = useGmStats(address, chainId);

    const handleOpenModal = React.useCallback(
      (refetch: () => Promise<unknown>) => {
        onOpenModal(refetch);
      },
      [onOpenModal]
    );

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
        sponsored={sponsored}
        stats={stats}
      />
    );
  }
);
