import type { Address } from "viem/accounts";
import { BASE_CHAIN_ID, type ChainId, DAILY_GM_ADDRESS } from "@/lib/constants";
import { getChainBtnClasses, isSponsoredOnChain } from "@/lib/utils";

type UseModalRendererLogicProps = {
  activeModalChainId: ChainId | null;
  chains: Array<{ id: ChainId; name: string }>;
  sponsored: boolean;
};

type ModalRendererResult =
  | {
      shouldRender: false;
      activeChain: null;
      activeContractAddress: null;
      chainBtnClasses: "";
      isSponsored: false;
    }
  | {
      shouldRender: true;
      activeChain: { id: ChainId; name: string };
      activeContractAddress: Address;
      chainBtnClasses: string;
      isSponsored: boolean;
    };

export function useModalRendererLogic({
  activeModalChainId,
  chains,
  sponsored,
}: UseModalRendererLogicProps): ModalRendererResult {
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

  const activeContractAddress =
    activeChain.id === BASE_CHAIN_ID
      ? (DAILY_GM_ADDRESS as Address)
      : undefined;
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
    chainBtnClasses: getChainBtnClasses(),
    isSponsored: isSponsoredOnChain(sponsored),
  };
}
