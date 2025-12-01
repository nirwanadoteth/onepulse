import { memo } from "react";
import { GMModal } from "@/components/gm-chain-card/gm-modal";
import { useModalRendererLogic } from "./use-modal-renderer-logic";

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
    const {
      shouldRender,
      activeContractAddress,
      chainBtnClasses,
      isSponsored,
    } = useModalRendererLogic({
      activeModalChainId,
      chains,
      sponsored,
    });

    if (!shouldRender) {
      return null;
    }

    return (
      <GMModal
        address={address}
        chainBtnClasses={chainBtnClasses}
        chainId={activeModalChainId}
        contractAddress={activeContractAddress}
        isContractReady={Boolean(activeContractAddress)}
        isOpen={true}
        isSponsored={isSponsored}
        onClose={onClose}
        processing={processing}
        refetchLastGmDay={refetchLastGmDay}
        setProcessing={setProcessing}
      />
    );
  }
);
