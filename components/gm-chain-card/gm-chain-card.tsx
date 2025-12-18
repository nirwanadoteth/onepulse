"use client";

import { memo } from "react";
import { Icons } from "@/components/icons";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemFooter,
  ItemMedia,
} from "@/components/ui/item";
import type { GmStats } from "@/hooks/use-gm-stats";
import { ActionButton } from "./action-button";
import { CountdownText } from "./countdown-text";
import { StatsDisplay } from "./stats-display";
import { useGMChainCardLogic } from "./use-gm-chain-card-logic";

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
    const {
      onCorrectChain,
      hasGmToday,
      gmDisabled,
      targetSec,
      chainBtnClasses,
      chainIconName,
      handleOpenModal,
    } = useGMChainCardLogic({
      chainId,
      contractAddress,
      isConnected,
      address,
      onStatusChange,
      onOpenModal,
    });

    return (
      <Item variant="outline">
        <ItemContent className="items-start">
          <ItemMedia>
            {Icons[chainIconName as keyof typeof Icons]?.({
              className: "h-8 w-24 text-current",
              role: "img",
              "aria-label": `${name} wordmark`,
              focusable: false,
            })}
          </ItemMedia>
        </ItemContent>
        <ItemActions>
          <StatsDisplay
            isConnected={isConnected}
            isStatsReady={isStatsReady}
            stats={stats}
          />
        </ItemActions>
        <ItemFooter className="flex-col">
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

GMChainCard.displayName = "GMChainCard";
