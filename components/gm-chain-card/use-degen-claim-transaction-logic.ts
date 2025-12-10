import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { useMiniAppContext } from "@/components/providers/miniapp-provider";
import { useClaimEligibility } from "@/hooks/use-degen-claim";
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
  const miniAppContext = useMiniAppContext();
  const verifiedFid = miniAppContext?.verifiedFid;

  const numericChainId = normalizeChainId(chainId);
  const contractAddress = numericChainId
    ? getDailyRewardsAddress(numericChainId)
    : undefined;
  const {
    canClaim,
    hasSentGMToday,
    isPending: isEligibilityPending,
    refetch: refetchEligibility,
    scoreCheckPassed,
    userScore,
  } = useClaimEligibility({ fid });

  const getClaimContracts = useClaimContracts({
    address,
    fid,
    verifiedFid,
    contractAddress,
  });

  const { onStatus } = useTransactionStatus({
    onSuccess,
    onError,
    refetchEligibility,
  });

  const isDisabled =
    disabled ||
    !address ||
    !fid ||
    !contractAddress ||
    !canClaim ||
    !hasSentGMToday ||
    isEligibilityPending;

  const buttonState = getButtonState({
    isConnected: Boolean(address),
    isEligibilityPending,
    hasSentGMToday,
    canClaim,
    scoreCheckPassed,
    userScore,
  });

  return {
    numericChainId,
    getClaimContracts,
    onStatus,
    isDisabled,
    buttonState,
  };
}
