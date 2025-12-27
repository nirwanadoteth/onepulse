import { base, celo, optimism } from "@reown/appkit/networks";
import { useAppKitNetwork } from "@reown/appkit/react";
import { useMemo, useState } from "react";
import type { Address } from "viem";
import { getButtonState } from "@/components/gm-chain-card/get-button-state";
import { extractClaimState } from "@/components/reward-card/utils";
import { useDailyRewardsV2Read } from "@/hooks/use-daily-rewards-v2-read";
import { useErc20Metadata } from "@/hooks/use-erc20-metadata";
import {
  useClaimEligibility,
  useDailyClaimCount,
} from "@/hooks/use-reward-claim";
import {
  BASE_CHAIN_ID,
  CELO_CHAIN_ID,
  OPTIMISM_CHAIN_ID,
} from "@/lib/constants";
import {
  REWARD_TOKEN_DECIMALS,
  REWARD_TOKEN_SYMBOLS,
  REWARD_TOKENS,
} from "@/lib/constants/daily-rewards-v2";
import {
  getChainBtnClasses,
  getDailyRewardsV2Address,
  normalizeChainId,
} from "@/lib/utils";

const TRAILING_ZEROS_REGEX = /\.?0+$/;

type UseRewardChainCardLogicProps = {
  chainId: number;
  fid: bigint | undefined;
  isConnected: boolean;
  address?: string;
};

function getChainIconName(chainId: number): string {
  switch (chainId) {
    case BASE_CHAIN_ID:
      return "base";
    case CELO_CHAIN_ID:
      return "celo";
    case OPTIMISM_CHAIN_ID:
      return "optimism";
    default:
      return "base";
  }
}

function getTokenAddress(
  rewardToken: string | undefined,
  chainId: number
): Address | undefined {
  if (rewardToken?.startsWith("0x")) {
    return rewardToken as Address;
  }
  const fallback = REWARD_TOKENS[chainId];
  if (fallback?.startsWith("0x")) {
    return fallback as Address;
  }
}

function getTokenSymbol(chainId: number): string {
  return REWARD_TOKEN_SYMBOLS[chainId] || "USDC";
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
  const { chainId: connectedChainId, switchNetwork } = useAppKitNetwork();
  const normalizedConnectedChainId = normalizeChainId(connectedChainId);
  const isCorrectChain = normalizedConnectedChainId === chainId;
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

  const contractAddress = getDailyRewardsV2Address(chainId);
  const rewardsRead = useDailyRewardsV2Read(contractAddress, chainId);
  const resolvedTokenAddress = getTokenAddress(
    rewardsRead.rewardToken,
    chainId
  );
  const metadata = useErc20Metadata(resolvedTokenAddress, chainId);

  const chainIconName = getChainIconName(chainId);
  const tokenSymbol = metadata.symbol ?? getTokenSymbol(chainId);
  const decimals = metadata.decimals ?? REWARD_TOKEN_DECIMALS[chainId] ?? 6;
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
