import { useState } from "react";
import type { ChainId } from "@/lib/constants";

export type ModalState = {
  activeModalChainId: ChainId | null;
  processing: boolean;
  setActiveModalChainId: (id: ChainId | null) => void;
  setProcessing: (value: boolean) => void;
  closeModal: () => void;
};

export function useModalManagement(): ModalState {
  const [activeModalChainId, setActiveModalChainId] = useState<ChainId | null>(
    null
  );
  const [processing, setProcessing] = useState(false);

  const closeModal = () => {
    setActiveModalChainId(null);
    setProcessing(false);
  };

  return {
    activeModalChainId,
    processing,
    setActiveModalChainId,
    setProcessing,
    closeModal,
  };
}
