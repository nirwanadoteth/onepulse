import { memo } from "react";
import { GMModal } from "@/components/gm-chain-card/gm-modal";
import {
  CELO_CHAIN_ID,
  DAILY_GM_ADDRESSES,
  OPTIMISM_CHAIN_ID,
} from "@/lib/constants";
import { isSponsoredOnChain } from "@/lib/utils";

type ModalRendererProps = {
  activeModalChainId: number | null;
  chains: Array<{ id: number; name: string }>;
  sponsored: boolean;
  address?: string;
  processing: boolean;
  setProcessing: (value: boolean) => void;
  refetchLastGmDay?: () => Promise<unknown>;
  onClose: () => void;
};

const getChainBtnClassesForId = (chainId: number): string => {
  if (chainId === CELO_CHAIN_ID) {
    return "bg-[#FCFF52] text-black hover:bg-[#FCFF52]/90 dark:bg-[#476520] dark:text-white dark:hover:bg-[#476520]/90";
  }
  if (chainId === OPTIMISM_CHAIN_ID) {
    return "bg-[#ff0420] text-white hover:bg-[#ff0420]/90";
  }
  return "bg-[#0052ff] text-white hover:bg-[#0052ff]/90";
};

export const ModalRenderer = memo(
  ({
    activeModalChainId,
    chains,
    sponsored,
    address,
    processing,
    setProcessing,
    refetchLastGmDay,
    onClose,
  }: ModalRendererProps) => {
    if (!activeModalChainId) {
      return null;
    }

    const activeChain = chains.find((c) => c.id === activeModalChainId);
    if (!activeChain) {
      return null;
    }

    const activeContractAddress = DAILY_GM_ADDRESSES[activeChain.id];
    if (!activeContractAddress) {
      return null;
    }

    return (
      <GMModal
        address={address}
        chainBtnClasses={getChainBtnClassesForId(activeModalChainId)}
        chainId={activeModalChainId}
        contractAddress={activeContractAddress}
        isContractReady={Boolean(activeContractAddress)}
        isOpen={true}
        isSponsored={isSponsoredOnChain(sponsored, activeModalChainId)}
        onClose={onClose}
        processing={processing}
        refetchLastGmDay={refetchLastGmDay}
        setProcessing={setProcessing}
      />
    );
  }
);
