"use client";

import { Icons } from "@/components/icons";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemFooter,
  ItemMedia,
} from "@/components/ui/item";
import type { ChainId } from "@/lib/constants";
import { ActionButton } from "./action-button";
import { StatsDisplay } from "./stats-display";
import { useGMChainCardLogic } from "./use-gm-chain-card-logic";

export type GMChainCardProps = {
  chainId: ChainId;
  name: string;
  contractAddress: `0x${string}`;
  isConnected: boolean;
  address?: `0x${string}`;
  isSponsored?: boolean;
};

export const GMChainCard = ({
  chainId,
  name,
  contractAddress,
  isConnected,
  address,
  isSponsored = false,
}: GMChainCardProps) => {
  const {
    onCorrectChain,
    hasGmToday,
    gmDisabled,
    chainBtnClasses,
    chainIconName,
    processing,
    setProcessing,
  } = useGMChainCardLogic({
    chainId,
    contractAddress,
    isConnected,
    address,
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
        <StatsDisplay address={address} isConnected={isConnected} />
      </ItemActions>
      <ItemFooter className="flex-col">
        <ActionButton
          address={address}
          chainBtnClasses={chainBtnClasses}
          chainId={chainId}
          contractAddress={contractAddress}
          gmDisabled={gmDisabled}
          hasGmToday={hasGmToday}
          isConnected={isConnected}
          isSponsored={isSponsored}
          name={name}
          onCorrectChain={onCorrectChain}
          processing={processing}
          setProcessingAction={setProcessing}
        />
      </ItemFooter>
    </Item>
  );
};
