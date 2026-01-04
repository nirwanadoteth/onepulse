import { useEffect, useState } from "react";
import { useConnection } from "wagmi";
import { useMiniAppContext } from "@/components/providers/miniapp-provider";
import { dailyRewardsV2Address } from "@/helpers/contracts";
import { useClaimEligibility } from "@/hooks/use-reward-claim";
import { signIn } from "@/lib/client-auth";
import type { ChainId } from "@/lib/constants";
import { handleError } from "@/lib/error-handling";
import { getButtonState } from "./get-button-state";
import { useClaimContracts } from "./use-claim-contracts";
import { useTransactionStatus } from "./use-transaction-status";

type UseRewardClaimTransactionLogicProps = {
  chainId: ChainId;
  fid: bigint | undefined;
  sponsored: boolean;
  onSuccess?: (txHash: string) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
};

export function useRewardClaimTransactionLogic({
  chainId: targetChainId,
  fid,
  onError,
  disabled = false,
}: UseRewardClaimTransactionLogicProps) {
  const { address } = useConnection();

  const contractAddress = dailyRewardsV2Address[targetChainId];
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
    onError,
    refetchEligibility,
    claimer: address,
  });

  const buttonState = getButtonState({
    isConnected: Boolean(address),
    isEligibilityPending,
    fidBlacklisted,
    hasSentGMToday,
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
