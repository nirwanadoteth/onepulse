import {
  Transaction,
  TransactionButton,
  TransactionSponsor,
} from "@coinbase/onchainkit/transaction";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ClaimFallbackUI } from "./claim-fallback-ui";
import { useRewardClaimTransactionLogic } from "./use-reward-claim-transaction-logic";

type RewardClaimTransactionProps = {
  className?: string | undefined;
  fid: bigint | undefined;
  handleSwitchChain: () => Promise<void>;
  isCorrectChain: boolean;
  sponsored: boolean;
  onSuccess?: (txHash: string) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
};

export function RewardClaimTransaction({
  className,
  fid,
  isCorrectChain,
  handleSwitchChain,
  sponsored,
  onSuccess,
  onError,
  disabled = false,
}: RewardClaimTransactionProps) {
  const {
    numericChainId,
    getClaimContracts,
    onStatus,
    isDisabled,
    buttonState,
  } = useRewardClaimTransactionLogic({
    fid,
    sponsored,
    onSuccess,
    onError,
    disabled,
  });

  const handleOnSubmit = useCallback(
    async (onSubmit: () => void) => {
      if (!isCorrectChain) {
        // Wait for chain switch to complete, then proceed with transaction
        await handleSwitchChain();
      }
      onSubmit();
    },
    [isCorrectChain, handleSwitchChain]
  );

  if (!numericChainId) {
    return <ClaimFallbackUI type="wallet" />;
  }

  return (
    <Transaction
      calls={getClaimContracts}
      chainId={numericChainId}
      isSponsored={sponsored}
      onStatus={onStatus}
    >
      <TransactionButton
        disabled={isDisabled}
        render={({ onSubmit, status }) => (
          <Button
            aria-busy={isDisabled || status === "pending"}
            className={`w-full ${className}`}
            disabled={isDisabled || status === "pending"}
            onClick={handleOnSubmit.bind(null, onSubmit)}
            size="lg"
          >
            {status === "pending" ? (
              <>
                <Spinner />
                Processing...
              </>
            ) : (
              buttonState.label
            )}
          </Button>
        )}
      />
      {sponsored && <TransactionSponsor />}
    </Transaction>
  );
}
