import { useSwitchChain } from "wagmi";
import type { ChainId } from "@/lib/constants";

type UseActionButtonLogicProps = {
  chainId: ChainId;
  gmDisabled: boolean;
};

export function useActionButtonLogic({ chainId }: UseActionButtonLogicProps) {
  const switchChain = useSwitchChain();

  return {
    doSwitch: () => switchChain.mutate({ chainId }),
    isLoading: switchChain.isPending,
  };
}
