import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { useCallback, useState } from "react";
import {
  useClaimEligibility,
  useDailyClaimCount,
  useMultichainDailyClaimCounts,
  useMultichainVaultStatus,
} from "@/hooks/use-reward-claim";
import {
  BASE_CHAIN_ID,
  CELO_CHAIN_ID,
  OPTIMISM_CHAIN_ID,
} from "@/lib/constants";
import { isSponsoredOnChain, normalizeChainId } from "@/lib/utils";
import { extractClaimState } from "./utils";

export function useRewardCard({
  fid,
  sponsored,
}: {
  fid: bigint | undefined;
  sponsored: boolean;
}) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const { address, isConnected } = useAppKitAccount({ namespace: "eip155" });
  const { chainId } = useAppKitNetwork();
  const numericChainId = normalizeChainId(chainId);
  const {
    claimStatus,
    hasSentGMToday,
    isPending: isCheckingEligibility,
  } = useClaimEligibility({
    fid,
    enabled: isConnected,
    chainId: numericChainId,
  });
  const { hasAnyRewards } = useMultichainVaultStatus();
  const dailyClaimsCount = useDailyClaimCount();
  const multichainCounts = useMultichainDailyClaimCounts();

  const hasClaimedToday = claimStatus?.claimerClaimedToday ?? false;

  const handleClaimSuccess = useCallback(() => {
    setIsShareModalOpen(true);
  }, []);

  const isSponsored = isSponsoredOnChain(sponsored, numericChainId);
  const claimState = extractClaimState(
    claimStatus,
    hasSentGMToday,
    dailyClaimsCount
  );

  const isWrongNetwork =
    numericChainId === undefined ||
    ![BASE_CHAIN_ID, CELO_CHAIN_ID, OPTIMISM_CHAIN_ID].includes(numericChainId);
  const isDisconnected = !(isConnected && address);
  // Check if ANY chain has rewards, not just the current one
  const hasRewards = hasAnyRewards;

  return {
    isShareModalOpen,
    setIsShareModalOpen,
    address,
    numericChainId,
    hasClaimedToday,
    isCheckingEligibility,
    handleClaimSuccess,
    isSponsored,
    claimState,
    isWrongNetwork,
    isDisconnected,
    hasRewards,
    dailyClaimsCount,
    multichainCounts,
  };
}
