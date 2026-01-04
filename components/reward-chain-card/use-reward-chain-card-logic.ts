import { useState } from "react";
import type { Address } from "viem/accounts";
import { useChainId, useSwitchChain } from "wagmi";
import { getButtonState } from "@/components/gm-chain-card/get-button-state";
import { extractClaimState } from "@/components/reward-chain-card/utils";
import { useDailyRewardsV2Read } from "@/hooks/use-daily-rewards-v2-read";
import { useErc20Metadata } from "@/hooks/use-erc20-metadata";
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

const TRAILING_ZEROS_REGEX = /\.?0+$/;

type UseRewardChainCardLogicProps = {
  chainId: ChainId;
  fid: bigint | undefined;
  isConnected: boolean;
  address?: string;
};

function getChainIconName(): string {
  return "base";
}

function getTokenAddress(
  rewardToken: string | undefined,
  _chainId: number
): Address | undefined {
  if (rewardToken?.startsWith("0x")) {
    return rewardToken as Address;
  }
  return REWARD_TOKEN as Address;
}

function getTokenSymbol(): string {
  return REWARD_TOKEN_SYMBOL;
}

function calculateDisplayAmount(
  amount: bigint | undefined,
  decimals: number,
  trailingZerosRegex: RegExp
): string {
  return amount && amount > 0n
    ? (Number(amount) / 10 ** decimals)
        .toFixed(3)
        .replace(trailingZerosRegex, "")
    : "0.01";
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

  const rewardsRead = useDailyRewardsV2Read(chainId);
  const resolvedTokenAddress = getTokenAddress(
    rewardsRead.rewardToken,
    chainId
  );
  const metadata = useErc20Metadata(resolvedTokenAddress, chainId);

  const chainIconName = getChainIconName();
  const tokenSymbol = metadata.symbol ?? getTokenSymbol();
  const decimals = metadata.decimals ?? REWARD_TOKEN_DECIMALS ?? 6;
  const tokenAddress = resolvedTokenAddress || "";

  const trailingZerosRegex = TRAILING_ZEROS_REGEX;
  const displayRewardAmount = calculateDisplayAmount(
    rewardsRead.claimRewardAmount,
    decimals,
    trailingZerosRegex
  );
  const claimLimitDisplay = rewardsRead.dailyClaimLimit
    ? Number(rewardsRead.dailyClaimLimit)
    : 250;

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
