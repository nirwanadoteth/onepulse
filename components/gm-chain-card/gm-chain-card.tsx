"use client";

import type { Address } from "viem/accounts";
import { Icons } from "@/components/icons";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemFooter,
  ItemMedia,
} from "@/components/ui/item";
import type { GmStats } from "@/hooks/use-gm-stats";
import type { ChainId } from "@/lib/constants";
import { ActionButton } from "./action-button";
import { StatsDisplay } from "./stats-display";
import { useGMChainCardLogic } from "./use-gm-chain-card-logic";

export type GMChainCardProps = {
  chainId: ChainId;
  name: string;
  contractAddress: Address;
  isConnected: boolean;
  address?: `0x${string}`;
  onStatusChangeAction?: (status: {
    chainId: ChainId;
    hasGmToday: boolean;
  }) => void;
  stats: GmStats;
  isStatsReady: boolean;
  onOpenModalAction?: (refetch: () => Promise<unknown>) => void;
};

export const GMChainCard = ({
  chainId,
  name,
  contractAddress,
  isConnected,
  address,
  onStatusChangeAction,
  stats,
  isStatsReady,
  onOpenModalAction,
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
    onStatusChange: onStatusChangeAction,
    onOpenModal: onOpenModalAction,
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
          onOpenModalAction={() => handleOpenModal()}
        />
      </ItemFooter>
    </Item>
  );
};
