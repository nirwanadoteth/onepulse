import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { useEffect, useState } from "react";
import { useClaimEligibility } from "@/hooks/use-reward-claim";
import { signIn } from "@/lib/client-auth";
import { handleError } from "@/lib/error-handling";
import { getDailyRewardsV2Address, normalizeChainId } from "@/lib/utils";
import { getButtonState } from "./get-button-state";
import { useClaimContracts } from "./use-claim-contracts";
import { useTransactionStatus } from "./use-transaction-status";

type UseRewardClaimTransactionLogicProps = {
  fid: bigint | undefined;
  sponsored: boolean;
  onSuccess?: (txHash: string) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
};

export function useRewardClaimTransactionLogic({
  fid,
  onSuccess,
  onError,
  disabled = false,
}: UseRewardClaimTransactionLogicProps) {
  const { address } = useAppKitAccount({ namespace: "eip155" });
  const { chainId } = useAppKitNetwork();

  const numericChainId = normalizeChainId(chainId);
  const contractAddress = numericChainId
    ? getDailyRewardsV2Address(numericChainId)
    : undefined;
  const {
    canClaim,
    hasSentGMToday,
    isPending: isEligibilityPending,
    refetch: refetchEligibility,
  } = useClaimEligibility({ fid });

  // Daily limit is checked in canClaimToday() contract function via useClaimEligibility
  // If canClaim is false, it means the daily limit was reached (among other checks)
  const isDailyLimitReached = !canClaim;

  const [cachedFid, setCachedFid] = useState<number | undefined>(undefined);

  useEffect(() => {
    const controller = new AbortController();

    const performSignIn = async () => {
      try {
        const signedInFid = await signIn();
        if (!controller.signal.aborted && signedInFid) {
          setCachedFid(signedInFid);
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
  }, []);

  const getClaimContracts = useClaimContracts({
    address,
    fid,
    contractAddress,
    cachedFid,
    chainId: numericChainId,
  });

  const { onStatus } = useTransactionStatus({
    onSuccess,
    onError,
    refetchEligibility,
    claimer: address,
  });

  const isDisabled =
    disabled ||
    !address ||
    !fid ||
    !contractAddress ||
    !canClaim ||
    !hasSentGMToday ||
    isEligibilityPending ||
    isDailyLimitReached;

  const buttonState = getButtonState({
    isConnected: Boolean(address),
    isEligibilityPending,
    hasSentGMToday,
    canClaim,
    isDailyLimitReached,
  });

  return {
    numericChainId,
    getClaimContracts,
    onStatus,
    isDisabled,
    buttonState,
  };
}
