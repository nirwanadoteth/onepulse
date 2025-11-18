import { memo } from "react";
import { GMModal } from "@/components/gm-chain-card/gm-modal";
import { DAILY_GM_ADDRESSES } from "@/lib/constants";
import { getChainBtnClasses, isSponsoredOnChain } from "@/lib/utils";

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
        chainBtnClasses={getChainBtnClasses(activeModalChainId)}
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
