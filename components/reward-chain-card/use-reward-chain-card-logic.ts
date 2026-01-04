import { useState } from "react";
import { useChainId, useSwitchChain } from "wagmi";
import { getButtonState } from "@/components/reward-chain-card/get-button-state";
import { extractClaimState } from "@/components/reward-chain-card/utils";
import {
  useClaimEligibility,
  useDailyClaimCount,
} from "@/hooks/use-reward-claim";
import {
  type ChainId,
  REWARD_TOKEN,
  REWARD_TOKEN_DECIMALS,
  REWARD_TOKEN_SYMBOL,
} from "@/lib/constants";
import { getChainBtnClasses } from "@/lib/utils";

type UseRewardChainCardLogicProps = {
  chainId: ChainId;
  fid: bigint | undefined;
  isConnected: boolean;
  address?: string;
};

function getChainIconName(): string {
  return "base";
}

function getTokenAddress(): `0x${string}` {
  return REWARD_TOKEN as `0x${string}`;
}

function getTokenSymbol(): string {
  return REWARD_TOKEN_SYMBOL;
}

export function useRewardChainCardLogic({
  chainId,
  fid,
  isConnected,
  address,
}: UseRewardChainCardLogicProps) {
  const currentChainId = useChainId();
  const switchChain = useSwitchChain();
  const isCorrectChain = currentChainId === chainId;
  const [isSwitching, setIsSwitching] = useState(false);

  const shouldCheckEligibility = isConnected && !!address && Boolean(fid);

  const { claimStatus, isPending: isCheckingEligibility } = useClaimEligibility(
    {
      fid,
      enabled: shouldCheckEligibility,
      chainId,
    }
  );

  const dailyClaimCount = useDailyClaimCount(chainId);

  const claimState = extractClaimState(claimStatus);
  const hasAlreadyClaimed = claimStatus?.fidClaimedToday ?? false;

  const buttonState = getButtonState({
    isConnected,
    isEligibilityPending: isCheckingEligibility,
    fidBlacklisted: claimStatus?.fidIsBlacklisted ?? false,
    hasSentGMToday: claimStatus?.hasSentGMToday ?? false,
    hasSharedMiniAppToday: claimStatus?.hasSharedMiniAppToday ?? false,
    canClaim: claimState?.isEligible ?? false,
    isDailyLimitReached: claimStatus?.globalLimitReached ?? false,
    isVaultDepleted:
      claimStatus && claimStatus.vaultBalance <= claimStatus.minReserve,
    hasAlreadyClaimed,
    hasFid: Boolean(fid),
  });

  const chainIconName = getChainIconName();
  const tokenSymbol = getTokenSymbol();
  const decimals = REWARD_TOKEN_DECIMALS;
  const tokenAddress = getTokenAddress();

  const displayRewardAmount = "0.008";
  const claimLimitDisplay = 750;

  const handleSwitchChain = async () => {
    try {
      setIsSwitching(true);
      await switchChain.mutateAsync({ chainId });
    } finally {
      setIsSwitching(false);
    }
  };

  const chainBtnClasses = getChainBtnClasses();

  return {
    isCorrectChain,
    claimState,
    isCheckingEligibility,
    dailyClaimCount,
    chainBtnClasses,
    handleSwitchChain,
    isSwitching,
    buttonState,
    hasAlreadyClaimed,
    chainIconName,
    tokenSymbol,
    decimals,
    tokenAddress,
    displayRewardAmount,
    claimLimitDisplay,
  };
}
