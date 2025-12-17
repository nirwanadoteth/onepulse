import { base, celo, optimism } from "@reown/appkit/networks";
import { useAppKitNetwork } from "@reown/appkit/react";
import { useMemo, useState } from "react";
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
import { getChainBtnClasses, normalizeChainId } from "@/lib/utils";

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

  const chainBtnClasses = useMemo(() => getChainBtnClasses(chainId), [chainId]);

  return {
    isCorrectChain,
    claimState,
    isCheckingEligibility,
    dailyClaimCount,
    chainBtnClasses,
    handleSwitchChain,
    isSwitching,
  };
}
