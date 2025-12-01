import { base } from "@reown/appkit/networks";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { useState } from "react";
import {
  useClaimEligibility,
  useRewardVaultStatus,
} from "@/hooks/use-degen-claim";
import { isSponsoredOnChain, normalizeChainId } from "@/lib/utils";
import { extractClaimState } from "./utils";

export function useDegenRewardCard({
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
  const { hasRewards } = useRewardVaultStatus();

  const hasClaimedToday = claimStatus?.claimerClaimedToday ?? false;

  const handleClaimSuccess = () => {
    setIsShareModalOpen(true);
  };

  const isSponsored = isSponsoredOnChain(sponsored, numericChainId);
  const claimState = extractClaimState(claimStatus, hasSentGMToday);

  const isWrongNetwork = numericChainId !== base.id;
  const isDisconnected = !(isConnected && address);

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
  };
}
