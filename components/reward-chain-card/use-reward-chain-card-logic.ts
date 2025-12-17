import { base, celo, optimism } from "@reown/appkit/networks";
import { useAppKitNetwork } from "@reown/appkit/react";
import { useState } from "react";
import { extractClaimState } from "@/components/reward-card/utils";
import {
  useClaimEligibility,
  useDailyClaimCount,
} from "@/hooks/use-reward-claim";
import {
  BASE_CHAIN_ID,
  CELO_CHAIN_ID,
  OPTIMISM_CHAIN_ID,
} from "@/lib/constants";
import { normalizeChainId } from "@/lib/utils";

type UseRewardChainCardLogicProps = {
  chainId: number;
  fid: bigint | undefined;
  isConnected: boolean;
  address?: string;
};

export function useRewardChainCardLogic({
  chainId,
  fid,
  isConnected,
  address,
}: UseRewardChainCardLogicProps) {
  const { chainId: connectedChainId, switchNetwork } = useAppKitNetwork();
  const normalizedConnectedChainId = normalizeChainId(connectedChainId);
  const isCorrectChain = normalizedConnectedChainId === chainId;
  const [isSwitching, setIsSwitching] = useState(false);

  const {
    claimStatus,
    hasSentGMToday,
    isPending: isCheckingEligibility,
  } = useClaimEligibility({
    fid,
    enabled: isConnected && !!address,
    chainId,
  });

  const dailyClaimCount = useDailyClaimCount(chainId);

  const claimState = extractClaimState(
    claimStatus,
    hasSentGMToday,
    dailyClaimCount
  );

  const getChainButtonClasses = (targetChainId: number): string => {
    switch (targetChainId) {
      case BASE_CHAIN_ID:
        return "bg-blue-500 hover:bg-blue-600 text-white";
      case CELO_CHAIN_ID:
        return "bg-green-500 hover:bg-green-600 text-white";
      case OPTIMISM_CHAIN_ID:
        return "bg-red-500 hover:bg-red-600 text-white";
      default:
        return "";
    }
  };

  const getNetworkObject = (targetChainId: number) => {
    switch (targetChainId) {
      case BASE_CHAIN_ID:
        return base;
      case CELO_CHAIN_ID:
        return celo;
      case OPTIMISM_CHAIN_ID:
        return optimism;
      default:
        return base;
    }
  };

  const handleSwitchChain = async () => {
    try {
      setIsSwitching(true);
      const network = getNetworkObject(chainId);
      await switchNetwork(network);
    } finally {
      setIsSwitching(false);
    }
  };

  return {
    isCorrectChain,
    claimState,
    isCheckingEligibility,
    dailyClaimCount,
    chainBtnClasses: getChainButtonClasses(chainId),
    handleSwitchChain,
    isSwitching,
  };
}
