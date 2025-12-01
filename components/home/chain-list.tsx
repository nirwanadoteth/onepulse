import { type Dispatch, memo, type SetStateAction } from "react";
import { DAILY_GM_ADDRESSES } from "@/lib/constants";
import { isSponsoredOnChain } from "@/lib/utils";
import type { Chain } from "./chain-config";
import { ChainSlide } from "./chain-slide";

type ChainListProps = {
  chains: Chain[];
  address: string | undefined;
  isConnected: boolean;
  sponsored: boolean;
  setActiveModalChainId: (id: number) => void;
  setActiveRefetchFn: Dispatch<
    SetStateAction<(() => Promise<unknown>) | undefined>
  >;
  handleStatus: (status: {
    chainId: number;
    hasGmToday: boolean;
    targetSec: number;
  }) => void;
};

export const ChainList = memo(
  ({
    chains,
    address,
    isConnected,
    sponsored,
    setActiveModalChainId,
    setActiveRefetchFn,
    handleStatus,
  }: ChainListProps) => (
    <div className="space-y-4">
      {chains.map((c) => {
        const contractAddress = DAILY_GM_ADDRESSES[c.id];
        return contractAddress ? (
          <ChainSlide
            address={address}
            chainId={c.id}
            chainName={c.name}
            contractAddress={contractAddress}
            isConnected={isConnected}
            key={c.id}
            onOpenModal={(refetch) => {
              setActiveModalChainId(c.id);
              setActiveRefetchFn(() => refetch);
            }}
            onStatusChange={handleStatus}
            sponsored={isSponsoredOnChain(sponsored, c.id)}
          />
        ) : null;
      })}
    </div>
  )
);
