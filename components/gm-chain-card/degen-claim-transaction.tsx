import {
  Transaction,
  TransactionButton,
  TransactionSponsor,
} from "@coinbase/onchainkit/transaction";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { memo } from "react";
import { useClaimEligibility } from "@/hooks/use-degen-claim";
import { getDailyRewardsAddress } from "@/lib/constants";
import { normalizeChainId } from "@/lib/utils";
import { TransactionToast } from "../transaction-toast";
import { ClaimFallbackUI } from "./claim-fallback-ui";
import { getButtonState } from "./get-button-state";
import { useClaimContracts } from "./use-claim-contracts";
import { useTransactionStatus } from "./use-transaction-status";

type DegenClaimTransactionProps = {
  fid: bigint | undefined;
  sponsored: boolean;
  onSuccess?: (txHash: string) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
};

/**
 * Component for claiming daily DEGEN rewards using OnchainKit Transaction with sponsorship.
 * Backend signs the claim authorization, user submits sponsored transaction.
 */
export const DegenClaimTransaction = memo(
  ({
    fid,
    sponsored,
    onSuccess,
    onError,
    disabled = false,
  }: DegenClaimTransactionProps) => {
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

    const getClaimContracts = useClaimContracts({
      address,
      fid,
      contractAddress,
    });

    const handleStatus = useTransactionStatus({
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

    const buttonState = getButtonState(
      Boolean(address),
      isEligibilityPending,
      hasSentGMToday,
      canClaim
    );

    if (buttonState.showFallback) {
      return <ClaimFallbackUI type={buttonState.showFallback} />;
    }

    return (
      <div className="relative w-full">
        <Transaction
          calls={getClaimContracts}
          chainId={numericChainId}
          isSponsored={sponsored}
          onStatus={handleStatus}
        >
          <TransactionButton
            className="w-full"
            disabled={isDisabled}
            text={buttonState.label}
          />
          {sponsored && <TransactionSponsor />}
          <TransactionToast />
        </Transaction>
      </div>
    );
  }
);
