import { useState } from "react";
import { useChainId } from "wagmi";
import type { ChainId } from "@/lib/constants";
import { getChainBtnClasses, getChainIconName } from "@/lib/utils";
import { useGMState } from "./use-gm-state";

type UseGMChainCardLogicProps = {
  chainId: ChainId;
  contractAddress: `0x${string}`;
  isConnected: boolean;
  address?: `0x${string}`;
};

export function useGMChainCardLogic({
  chainId,
  contractAddress,
  isConnected,
  address,
}: UseGMChainCardLogicProps) {
  const currentChainId = useChainId();
  const onCorrectChain = currentChainId === chainId;
  const [processing, setProcessing] = useState(false);

  const { hasGmToday, gmDisabled } = useGMState(
    chainId,
    contractAddress,
    isConnected,
    address
  );

  const chainBtnClasses = getChainBtnClasses();

  const chainIconName = getChainIconName();

  return {
    onCorrectChain,
    hasGmToday,
    gmDisabled,
    chainBtnClasses,
    chainIconName,
    processing,
    setProcessing,
  };
}
