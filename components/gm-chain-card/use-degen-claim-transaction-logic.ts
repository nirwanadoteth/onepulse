import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useClaimEligibility, useClaimStats } from "@/hooks/use-degen-claim";
import { signIn } from "@/lib/client-auth";
import { DAILY_CLAIM_LIMIT } from "@/lib/constants";
import { getDailyRewardsAddress, normalizeChainId } from "@/lib/utils";
import { getButtonState } from "./get-button-state";
import { useClaimContracts } from "./use-claim-contracts";
import { useTransactionStatus } from "./use-transaction-status";

type UseDegenClaimTransactionLogicProps = {
  fid: bigint | undefined;
  sponsored: boolean;
  onSuccess?: (txHash: string) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
};

export function useDegenClaimTransactionLogic({
  fid,
  onSuccess,
  onError,
  disabled = false,
}: UseDegenClaimTransactionLogicProps) {
  const { address } = useAppKitAccount({ namespace: "eip155" });
  const { chainId } = useAppKitNetwork();

  const numericChainId = normalizeChainId(chainId);
  const contractAddress = numericChainId
    ? getDailyRewardsAddress(numericChainId)
    : undefined;
  const {
    canClaim,
    hasSentGMToday,
    isPending: isEligibilityPending,
    refetch: refetchEligibility,
  } = useClaimEligibility({ fid });

  const { count: dailyClaimsCount } = useClaimStats();
  const isDailyLimitReached = dailyClaimsCount >= DAILY_CLAIM_LIMIT;

  const [cachedFid, setCachedFid] = useState<number | undefined>(undefined);

  useEffect(() => {
    signIn()
      .then((signedInFid) => {
        if (signedInFid) {
          setCachedFid(signedInFid);
        }
      })
      .catch((error) => {
        console.error("Sign-in error:", error);
        toast.error("Failed to sign in");
      });
  }, []);

  const getClaimContracts = useClaimContracts({
    address,
    fid,
    contractAddress,
    cachedFid,
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
