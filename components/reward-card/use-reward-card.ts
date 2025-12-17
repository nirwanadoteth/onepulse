import { base } from "@reown/appkit/networks";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { useCallback, useState } from "react";
import {
  useClaimEligibility,
  useDailyClaimCount,
  useMultichainDailyClaimCounts,
  useMultichainVaultStatus,
} from "@/hooks/use-reward-claim";
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

  const isWrongNetwork = numericChainId !== base.id;
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
