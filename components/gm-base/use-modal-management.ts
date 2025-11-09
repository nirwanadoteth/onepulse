import { useState } from "react";

export type ModalState = {
  activeModalChainId: number | null;
  processing: boolean;
  setActiveModalChainId: (id: number | null) => void;
  setProcessing: (value: boolean) => void;
  closeModal: () => void;
};

export function useModalManagement(): ModalState {
  const [activeModalChainId, setActiveModalChainId] = useState<number | null>(
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
