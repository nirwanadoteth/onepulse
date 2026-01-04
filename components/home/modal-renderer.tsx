import dynamic from "next/dynamic";
import type { ChainId } from "@/lib/constants";
import { useModalRendererLogic } from "./use-modal-renderer-logic";

const GMModal = dynamic(
  () => import("@/components/gm-chain-card/gm-modal").then((mod) => mod.GMModal),
  { ssr: false }
);

type ModalRendererProps = {
  activeModalChainId: ChainId | null;
  chains: Array<{ id: ChainId; name: string }>;
  sponsored: boolean;
  address?: `0x${string}`;
  processing: boolean;
  setProcessing: (value: boolean) => void;
  refetchLastGmDay?: () => Promise<unknown>;
  onClose: () => void;
};

export function ModalRenderer({
  activeModalChainId,
  chains,
  sponsored,
  address,
  processing,
  setProcessing,
  refetchLastGmDay,
  onClose,
}: ModalRendererProps) {
  const {
    shouldRender,
    activeChain,
    activeContractAddress,
    chainBtnClasses,
    isSponsored,
  } = useModalRendererLogic({
    activeModalChainId,
    chains,
    sponsored,
  });

  if (!address) {
    return null;
  }

  if (!shouldRender) {
    return null;
  }

  return (
    <GMModal
      address={address}
        chainBtnClasses={chainBtnClasses}
        chainId={activeChain.id}
        contractAddress={activeContractAddress}
        isContractReady={Boolean(activeContractAddress)}
        isOpen={true}
        isSponsored={isSponsored}
        onCloseAction={onClose}
        processing={processing}
        refetchLastGmDayAction={refetchLastGmDay}
        setProcessingAction={setProcessing}
      />
    );
  }

