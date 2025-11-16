"use client";

import { useAppKitAccount } from "@reown/appkit/react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GMChainCard } from "@/components/gm-chain-card/gm-chain-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useGmStats } from "@/hooks/use-gm-stats";
import { DAILY_GM_ADDRESSES } from "@/lib/constants";
import { minikitConfig } from "@/minikit.config";
import {
  areAllChainsComplete,
  getChainList,
  getNextTargetSec,
} from "./home/chain-config";
import { CongratsDialog } from "./home/congrats-dialog";
import { ModalRenderer } from "./home/modal-renderer";
import { useConfettiControl } from "./home/use-confetti-control";
import { useCongratsLogic } from "./home/use-congrats-logic";
import { useLastCongratsDay } from "./home/use-last-congrats-day";
import { useModalManagement } from "./home/use-modal-management";
import { usePerChainStatus } from "./home/use-per-chain-status";

export const Home = memo(
  ({
    sponsored,
    allowedChainIds,
    onGmStatsChange,
    onShareClick,
  }: {
    sponsored?: boolean;
    allowedChainIds?: number[];
    onGmStatsChange?: (stats: ReturnType<typeof useGmStats>) => void;
    onShareClick?: () => void;
  }) => {
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

    // Overall GM stats for sharing (aggregate across chains)
    const gmStatsResult = useGmStats(address);

    // Notify parent only when stats actually change (prevents infinite re-render loop)
    const prevStatsRef = useRef<ReturnType<typeof useGmStats>["stats"] | null>(
      null
    );

    const stats = gmStatsResult.stats;

    useEffect(() => {
      if (!onGmStatsChange) {
        return;
      }
      if (!stats) {
        return;
      }
      const prev = prevStatsRef.current;
      const changed =
        !prev ||
        prev.currentStreak !== stats.currentStreak ||
        prev.highestStreak !== stats.highestStreak ||
        prev.allTimeGmCount !== stats.allTimeGmCount ||
        prev.lastGmDay !== stats.lastGmDay;
      if (!changed) {
        return;
      }
      prevStatsRef.current = stats;
      onGmStatsChange(gmStatsResult);
    }, [stats, gmStatsResult.isReady, onGmStatsChange, gmStatsResult]);

    const { statusMap, handleStatus } = usePerChainStatus();

    const allDone = useMemo(
      () => areAllChainsComplete(chainIds, statusMap),
      [chainIds, statusMap]
    );

    const nextTargetSec = useMemo(
      () => getNextTargetSec(chainIds, statusMap),
      [chainIds, statusMap]
    );

    const { lastCongratsDay, setLastCongratsDay } = useLastCongratsDay();

    const { confettiRef } = useConfettiControl(false, isConnected);

    const { showCongrats, setShowCongrats } = useCongratsLogic({
      allDone,
      isConnected,
      lastCongratsDay,
      onLastCongratsDayUpdate: setLastCongratsDay,
    });

    useEffect(() => {
      if (showCongrats) {
        confettiRef.current?.fire?.();
      }
    }, [showCongrats, confettiRef]);

    return (
      <div className="mt-4 mb-12 space-y-4">
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
          gmStats={gmStatsResult.stats}
          nextTargetSec={nextTargetSec}
          onOpenChange={(val) => {
            if (!val) {
              setShowCongrats(false);
            }
          }}
          onShare={onShareClick}
          open={Boolean(showCongrats && allDone)}
        />
      </div>
    );
  }
);

const ChainSlide = memo(
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

    const handleOpenModal = useCallback(
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
