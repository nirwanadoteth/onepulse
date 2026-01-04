import { useSwitchChain } from "wagmi";
import type { ChainId } from "@/lib/constants";

type UseActionButtonLogicProps = {
  chainId: ChainId;
  gmDisabled: boolean;
  onOpenModal: () => void;
};

export function useActionButtonLogic({
  chainId,
  gmDisabled,
  onOpenModal,
}: UseActionButtonLogicProps) {
  const switchChain = useSwitchChain();

  const handleOpenModal = () => {
    if (!gmDisabled) {
      onOpenModal();
    }
  };

  return {
    doSwitch: () => switchChain.mutate({ chainId }),
    isLoading: switchChain.isPending,
    handleOpenModal,
  };
}
