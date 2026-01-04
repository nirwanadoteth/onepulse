import { useEffect } from "react";
import type { Address } from "viem/accounts";
import { useChainId } from "wagmi";
import type { ChainId } from "@/lib/constants";
import { getChainBtnClasses, getChainIconName } from "@/lib/utils";
import { useGMState } from "./use-gm-state";

type UseGMChainCardLogicProps = {
  chainId: ChainId;
  contractAddress: Address;
  isConnected: boolean;
  address?: `0x${string}`;
  onStatusChange?: (status: { chainId: ChainId; hasGmToday: boolean }) => void;
  onOpenModal?: (refetch: () => Promise<unknown>) => void;
};

export function useGMChainCardLogic({
  chainId,
  contractAddress,
  isConnected,
  address,
  onStatusChange,
  onOpenModal,
}: UseGMChainCardLogicProps) {
  const currentChainId = useChainId();
  const onCorrectChain = currentChainId === chainId;

  const { hasGmToday, gmDisabled, refetchLastGmDay } = useGMState(
    chainId,
    contractAddress,
    isConnected,
    address
  );

  useEffect(() => {
    onStatusChange?.({ chainId, hasGmToday });
  }, [chainId, hasGmToday, onStatusChange]);

  const chainBtnClasses = getChainBtnClasses();

  const chainIconName = getChainIconName();

  const handleOpenModal = () => {
    if (onOpenModal) {
      onOpenModal(refetchLastGmDay);
    }
  };

  return {
    onCorrectChain,
    hasGmToday,
    gmDisabled,
    chainBtnClasses,
    chainIconName,
    handleOpenModal,
  };
}
