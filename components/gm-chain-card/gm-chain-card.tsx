"use client";

import { memo } from "react";
import type { Address } from "viem";
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
import { StatsDisplay } from "./stats-display";
import { useGMChainCardLogic } from "./use-gm-chain-card-logic";

export type GMChainCardProps = {
  chainId: number;
  name: string;
  contractAddress: Address;
  isConnected: boolean;
  address?: string;
  onStatusChange?: (status: { chainId: number; hasGmToday: boolean }) => void;
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
            chainId={chainId}
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
          />
        </ItemFooter>
      </Item>
    );
  }
);

GMChainCard.displayName = "GMChainCard";
