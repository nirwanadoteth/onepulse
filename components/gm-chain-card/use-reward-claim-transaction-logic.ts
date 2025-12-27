import { useAppKitAccount } from "@reown/appkit/react";
import { useEffect, useState } from "react";
import { useMiniAppContext } from "@/components/providers/miniapp-provider";
import { useClaimEligibility } from "@/hooks/use-reward-claim";
import { signIn } from "@/lib/client-auth";
import { handleError } from "@/lib/error-handling";
import { getDailyRewardsV2Address } from "@/lib/utils";
import { getButtonState } from "./get-button-state";
import { useClaimContracts } from "./use-claim-contracts";
import { useTransactionStatus } from "./use-transaction-status";

type UseRewardClaimTransactionLogicProps = {
  chainId: number;
  fid: bigint | undefined;
  sponsored: boolean;
  onSuccess?: (txHash: string) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
};

export function useRewardClaimTransactionLogic({
  chainId: targetChainId,
  fid,
  onSuccess,
  onError,
  disabled = false,
}: UseRewardClaimTransactionLogicProps) {
  const { address } = useAppKitAccount({ namespace: "eip155" });

  const contractAddress = targetChainId
    ? getDailyRewardsV2Address(targetChainId)
    : undefined;
  const {
    canClaim,
    claimStatus,
    hasSentGMToday,
    isPending: isEligibilityPending,
    refetch: refetchEligibility,
  } = useClaimEligibility({ fid, chainId: targetChainId });

  // Determine specific reason why claim is not possible
  const isVaultDepleted =
    claimStatus && claimStatus.vaultBalance <= claimStatus.minReserve;
  const fidBlacklisted = claimStatus?.fidIsBlacklisted ?? false;
  const hasAlreadyClaimed = claimStatus?.fidClaimedToday ?? false;
  const isDailyLimitReached = claimStatus?.globalLimitReached ?? false;

  const [cachedFid, setCachedFid] = useState<number | undefined>(undefined);
  const miniAppContext = useMiniAppContext();
  const isInMiniApp = miniAppContext?.isInMiniApp ?? false;

  useEffect(() => {
    // Only attempt sign in if we're in a mini app context
    // (Quick Auth is only available in mini apps)
    if (!isInMiniApp) {
      return;
    }

    const controller = new AbortController();

    const performSignIn = async () => {
      try {
        const signedInFid = await signIn();
        if (!controller.signal.aborted && signedInFid?.fid) {
          setCachedFid(signedInFid.fid);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          handleError(error, "Failed to sign in", {
            operation: "RewardClaimTransaction",
          });
        }
      }
    };

    performSignIn();

    return () => {
      controller.abort();
    };
  }, [isInMiniApp]);

  const getClaimContracts = useClaimContracts({
    address,
    fid,
    contractAddress,
    cachedFid,
    chainId: targetChainId,
  });

  const { onStatus } = useTransactionStatus({
    onSuccess,
    onError,
    refetchEligibility,
    claimer: address,
  });

  const buttonState = getButtonState({
    isConnected: Boolean(address),
    isEligibilityPending,
    fidBlacklisted,
    hasSentGMToday,
    hasSharedMiniAppToday: claimStatus?.hasSharedMiniAppToday ?? false,
    canClaim,
    isDailyLimitReached,
    isVaultDepleted,
    hasAlreadyClaimed,
    hasFid: Boolean(fid),
  });

  // If already claimed, disable regardless of network
  if (hasAlreadyClaimed) {
    return {
      numericChainId: targetChainId,
      getClaimContracts,
      onStatus,
      isDisabled: true,
      buttonState,
    };
  }

  const isDisabled =
    disabled ||
    !address ||
    !fid ||
    !contractAddress ||
    !canClaim ||
    !hasSentGMToday ||
    isEligibilityPending ||
    isDailyLimitReached ||
    buttonState.disabled;

  return {
    numericChainId: targetChainId,
    getClaimContracts,
    onStatus,
    isDisabled,
    buttonState,
  };
}
