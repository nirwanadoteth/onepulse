import { useCallback, useEffect, useState } from "react";
import { useChainId, useSwitchChain } from "wagmi";
import {
  BASE_CHAIN_ID,
  CELO_CHAIN_ID,
  OPTIMISM_CHAIN_ID,
} from "@/lib/constants";
import {
  DAILY_REWARDS_V2_ADDRESSES,
  REWARD_TOKEN_DECIMALS,
  REWARD_TOKEN_SYMBOLS,
  REWARD_TOKENS,
} from "@/lib/constants/daily-rewards-v2";

export function useDailyRewardsV2Config() {
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [selectedChainId, setSelectedChainId] = useState<number>(chainId);

  useEffect(() => {
    setSelectedChainId(chainId);
  }, [chainId]);

  const handleChainChange = useCallback(
    (newChainId: number) => {
      setSelectedChainId(newChainId);
      switchChain?.({ chainId: newChainId });
    },
    [switchChain]
  );

  const getChainName = useCallback((id: number): string => {
    switch (id) {
      case BASE_CHAIN_ID:
        return "Base";
      case CELO_CHAIN_ID:
        return "Celo";
      case OPTIMISM_CHAIN_ID:
        return "Optimism";
      default:
        return "Unknown";
    }
  }, []);

  const getContractAddress = useCallback(
    (id: number): `0x${string}` | "" => DAILY_REWARDS_V2_ADDRESSES[id] || "",
    []
  );

  const getRewardTokenSymbol = useCallback(
    (id: number): string => REWARD_TOKEN_SYMBOLS[id] || "TOKEN",
    []
  );

  const getRewardTokenDecimals = useCallback(
    (id: number): number => REWARD_TOKEN_DECIMALS[id] || 18,
    []
  );

  const currentContractAddress = getContractAddress(selectedChainId);
  const currentTokenSymbol = getRewardTokenSymbol(selectedChainId);
  const currentTokenDecimals = getRewardTokenDecimals(selectedChainId);
  const currentTokenAddress = REWARD_TOKENS[selectedChainId] || "";

  return {
    selectedChainId,
    setSelectedChainId: handleChainChange,
    currentContractAddress,
    currentTokenAddress,
    currentTokenSymbol,
    currentTokenDecimals,
    getChainName,
    getContractAddress,
    getRewardTokenSymbol,
    getRewardTokenDecimals,
    supportedChains: [BASE_CHAIN_ID, CELO_CHAIN_ID, OPTIMISM_CHAIN_ID],
  };
}
