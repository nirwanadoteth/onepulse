"use client";

import { useAppKitNetwork } from "@reown/appkit/react";
import { memo, useCallback, useEffect, useMemo } from "react";
import type { Address } from "viem";
import { useReadContract } from "wagmi";
import type { base, celo, optimism } from "wagmi/chains";
import { Icons } from "@/components/icons";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemMedia,
} from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";
import type { GmStats } from "@/hooks/use-gm-stats";
import { dailyGMAbi } from "@/lib/abi/daily-gm";
import { SECONDS_PER_DAY } from "@/lib/constants";
import {
  getChainBtnClasses,
  getCurrentTimestampSeconds,
  isCeloChain,
  isOptimismChain,
  normalizeChainId,
  timestampToDayNumber,
} from "@/lib/utils";
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
  const nowSec = getCurrentTimestampSeconds();
  const currentDay = timestampToDayNumber(nowSec);
  const alreadyGmToday = lastDay >= currentDay;
  const nextDayStartSec = (currentDay + 1) * SECONDS_PER_DAY;

  return {
    hasGmToday: alreadyGmToday,
    gmDisabled: alreadyGmToday || isPendingLastGm,
    targetSec: nextDayStartSec,
  };
};

const getChainIconName = (chainId: number): string => {
  if (isOptimismChain(chainId)) {
    return "optimism";
  }
  if (isCeloChain(chainId)) {
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
    const { chainId: currentChainId } = useAppKitNetwork();
    const numericChainId = normalizeChainId(currentChainId);
    const onCorrectChain = numericChainId === chainId;

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
      () => getChainBtnClasses(chainId),
      [chainId]
    );

    const chainIconName = useMemo(() => getChainIconName(chainId), [chainId]);

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
