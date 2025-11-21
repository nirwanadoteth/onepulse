import { useMemo } from "react";

import {
  CELO_CHAIN_ID,
  SUPPORTED_CHAINS,
  type SupportedChain,
} from "@/lib/constants";

export type ProfileChain = SupportedChain;

export function useProfileChains(
  allowedChainIds?: number[],
  isSmartWallet?: boolean
): ProfileChain[] {
  return useMemo(() => {
    let list: ProfileChain[] = [...SUPPORTED_CHAINS];
    if (Array.isArray(allowedChainIds) && allowedChainIds.length > 0) {
      list = list.filter((c) => allowedChainIds.includes(c.id));
    } else if (isSmartWallet) {
      list = list.filter((c) => c.id !== CELO_CHAIN_ID);
    }
    return list;
  }, [allowedChainIds, isSmartWallet]);
}
