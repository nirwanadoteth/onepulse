"use client";

import { memo, useCallback, useEffect, useMemo } from "react";
import type { Address } from "viem";
import { useChainId, useReadContract } from "wagmi";
import type { base, celo, optimism } from "wagmi/chains";
import { Icons } from "@/components/icons";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemMedia,
} from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";
import type { GmStats } from "@/hooks/use-gm-stats";
import { dailyGMAbi } from "@/lib/abi/daily-gm";

import { CarouselNext, CarouselPrevious } from "../ui/carousel";
import { ActionButton } from "./action-button";
import { CountdownText } from "./countdown-text";

const computeGMState = (params: {
  address: string | undefined;
  contractAddress: `0x${string}`;
  isConnected: boolean;
  lastGmDayData: unknown;
  isPendingLastGm: boolean;
}) => {
  const {
    address,
    contractAddress,
    isConnected,
    lastGmDayData,
    isPendingLastGm,
  } = params;
  if (!(address && contractAddress)) {
    return { hasGmToday: false, gmDisabled: !isConnected, targetSec: 0 };
  }

  if (lastGmDayData === undefined) {
    return { hasGmToday: false, gmDisabled: true, targetSec: 0 };
  }

  const lastDay = Number((lastGmDayData as bigint) ?? 0n);
  const nowSec = Math.floor(Date.now() / 1000);
  const currentDay = Math.floor(nowSec / 86_400);
  const alreadyGmToday = lastDay >= currentDay;
  const nextDayStartSec = (currentDay + 1) * 86_400;

  return {
    hasGmToday: alreadyGmToday,
    gmDisabled: alreadyGmToday || isPendingLastGm,
    targetSec: nextDayStartSec,
  };
};

const getChainBtnClasses = (chainId: number, name: string): string => {
  const isCelo = name.toLowerCase() === "celo" || chainId === 42_220;
  const isOptimism = name.toLowerCase() === "optimism" || chainId === 10;

  if (isCelo) {
    return "bg-[#FCFF52] text-black hover:bg-[#FCFF52]/90 dark:bg-[#476520] dark:text-white dark:hover:bg-[#476520]/90";
  }
  if (isOptimism) {
    return "bg-[#ff0420] text-white hover:bg-[#ff0420]/90";
  }
  return "bg-[#0052ff] text-white hover:bg-[#0052ff]/90";
};

const getChainIconName = (chainId: number, name: string): string => {
  if (name.toLowerCase() === "optimism" || chainId === 10) {
    return "optimism";
  }
  if (name.toLowerCase() === "celo" || chainId === 42_220) {
    return "celo";
  }
  return "base";
};

const StatsDisplay = memo(
  ({
    stats,
    isConnected,
    isStatsReady,
  }: {
    stats: GmStats;
    isConnected: boolean;
    isStatsReady: boolean;
  }) => {
    if (!(isConnected && stats)) {
      return (
        <div className="text-muted-foreground text-xs">
          Connect wallet to see stats
        </div>
      );
    }

    return (
      <div className="grid grid-cols-3 gap-3 text-center">
        <StatColumn
          label="Current"
          value={isStatsReady ? stats.currentStreak : undefined}
        />
        <StatColumn
          label="Highest"
          value={isStatsReady ? stats.highestStreak : undefined}
        />
        <StatColumn
          label="All-Time"
          value={isStatsReady ? stats.allTimeGmCount : undefined}
        />
      </div>
    );
  }
);

const StatColumn = memo(
  ({ value, label }: { value: number | undefined; label: string }) => (
    <div className="flex flex-col items-center gap-1">
      <span className="font-bold text-2xl tracking-tight">
        {value !== undefined ? value : <Spinner className="inline h-6 w-6" />}
      </span>
      <span className="font-medium text-muted-foreground text-xs">{label}</span>
    </div>
  )
);

export type GMChainCardProps = {
  chainId: number;
  name: string;
  contractAddress: `0x${string}`;
  isConnected: boolean;
  address?: string;
  onStatusChange?: (status: {
    chainId: number;
    hasGmToday: boolean;
    targetSec: number;
  }) => void;
  sponsored: boolean;
  stats: GmStats;
  isStatsReady: boolean;
  onOpenModal?: (refetch: () => Promise<unknown>) => void;
};

export const GMChainCard = memo(
  ({
    chainId,
    name,
    contractAddress,
    isConnected,
    address,
    onStatusChange,
    stats,
    isStatsReady,
    onOpenModal,
  }: GMChainCardProps) => {
    const currentChainId = useChainId();
    const onCorrectChain = currentChainId === chainId;

    const {
      data: lastGmDayData,
      isPending: isPendingLastGm,
      refetch: refetchLastGmDay,
    } = useReadContract({
      chainId: chainId as typeof base.id | typeof celo.id | typeof optimism.id,
      abi: dailyGMAbi,
      address: contractAddress,
      functionName: "lastGMDay",
      args: address ? [address as Address] : undefined,
      query: { enabled: Boolean(address && contractAddress) },
    });

    const { hasGmToday, gmDisabled, targetSec } = useMemo(
      () =>
        computeGMState({
          address,
          contractAddress,
          isConnected,
          lastGmDayData,
          isPendingLastGm,
        }),
      [address, contractAddress, isConnected, lastGmDayData, isPendingLastGm]
    );

    useEffect(() => {
      onStatusChange?.({ chainId, hasGmToday, targetSec });
    }, [chainId, hasGmToday, targetSec, onStatusChange]);

    const chainBtnClasses = useMemo(
      () => getChainBtnClasses(chainId, name),
      [chainId, name]
    );

    const chainIconName = useMemo(
      () => getChainIconName(chainId, name),
      [chainId, name]
    );

    const handleOpenModal = useCallback(() => {
      if (onOpenModal) {
        onOpenModal(refetchLastGmDay);
      }
    }, [onOpenModal, refetchLastGmDay]);

    return (
      <Item variant="outline">
        <ItemContent>
          <ItemMedia>
            {Icons[chainIconName as keyof typeof Icons]?.({
              className: "h-8 w-24 text-current",
              role: "img",
              "aria-label": `${name} wordmark`,
              focusable: false,
            })}
          </ItemMedia>
          <ItemDescription>Amplify your {name} GM</ItemDescription>
        </ItemContent>
        <ItemActions>
          <div className="flex items-center justify-center gap-2">
            <CarouselPrevious className="static translate-y-0" />
            <CarouselNext className="static translate-y-0" />
          </div>
        </ItemActions>
        <ItemFooter className="flex-col">
          <div className="mb-4 w-full">
            <StatsDisplay
              isConnected={isConnected}
              isStatsReady={isStatsReady}
              stats={stats}
            />
          </div>
          <ActionButton
            chainBtnClasses={chainBtnClasses}
            chainId={chainId}
            gmDisabled={gmDisabled}
            hasGmToday={hasGmToday}
            isConnected={isConnected}
            name={name}
            onCorrectChain={onCorrectChain}
            onOpenModal={() => handleOpenModal()}
            renderCountdown={(sec: number) => <CountdownText targetSec={sec} />}
            targetSec={targetSec}
          />
        </ItemFooter>
      </Item>
    );
  }
);
