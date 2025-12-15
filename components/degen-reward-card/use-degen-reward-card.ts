import { base } from "@reown/appkit/networks";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import {
  useClaimEligibility,
  useClaimStats,
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
  const { count: dailyClaimsCount, mutate: mutateClaimStats } = useClaimStats();

  const hasClaimedToday = claimStatus?.claimerClaimedToday ?? false;

  const handleClaimSuccess = useCallback(async () => {
    setIsShareModalOpen(true);
    // Wait a brief moment for the backend to process the claim and update the count
    await new Promise((resolve) => setTimeout(resolve, 500));
    // Force immediate refetch of claim stats (bypass cache) to update the counter
    // revalidate: true forces SWR to fetch fresh data from the server
    const result = await mutateClaimStats();
    toast.info(`UI refreshed, new count: ${result?.count ?? "unknown"}`);
  }, [mutateClaimStats]);

  const isSponsored = isSponsoredOnChain(sponsored, numericChainId);
  const claimState = extractClaimState(
    claimStatus,
    hasSentGMToday,
    dailyClaimsCount
  );

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
    dailyClaimsCount,
  };
}
