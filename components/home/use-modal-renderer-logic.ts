import { DAILY_GM_ADDRESSES } from "@/lib/constants";
import { getChainBtnClasses, isSponsoredOnChain } from "@/lib/utils";

type UseModalRendererLogicProps = {
  activeModalChainId: number | null;
  chains: Array<{ id: number; name: string }>;
  sponsored: boolean;
};

export function useModalRendererLogic({
  activeModalChainId,
  chains,
  sponsored,
}: UseModalRendererLogicProps) {
  if (!activeModalChainId) {
    return {
      shouldRender: false,
      activeChain: null,
      activeContractAddress: null,
      chainBtnClasses: "",
      isSponsored: false,
    };
  }

  const activeChain = chains.find((c) => c.id === activeModalChainId);
  if (!activeChain) {
    return {
      shouldRender: false,
      activeChain: null,
      activeContractAddress: null,
      chainBtnClasses: "",
      isSponsored: false,
    };
  }

  const activeContractAddress = DAILY_GM_ADDRESSES[activeChain.id];
  if (!activeContractAddress) {
    return {
      shouldRender: false,
      activeChain: null,
      activeContractAddress: null,
      chainBtnClasses: "",
      isSponsored: false,
    };
  }

  return {
    shouldRender: true,
    activeChain,
    activeContractAddress,
    chainBtnClasses: getChainBtnClasses(activeModalChainId),
    isSponsored: isSponsoredOnChain(sponsored, activeModalChainId),
  };
}
