import { Button } from "@/components/ui/button";
import {
  Transaction,
  TransactionButton,
} from "@/components/ui/custom-transaction";
import { Spinner } from "@/components/ui/spinner";
import type { ChainId } from "@/lib/constants";
import { ClaimFallbackUI } from "./claim-fallback-ui";
import { useRewardClaimTransactionLogic } from "./use-reward-claim-transaction-logic";

type RewardClaimTransactionProps = {
  chainId: ChainId;
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
  chainId,
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
    chainId,
    fid,
    sponsored,
    onSuccess,
    onError,
    disabled,
  });

  const handleOnSubmit = async (onSubmit: () => void) => {
      if (!isCorrectChain) {
        // Wait for chain switch to complete, then proceed with transaction
        await handleSwitchChain();
      }
      onSubmit();
    };

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
        renderAction={({ onSubmit, status }) => (
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
    </Transaction>
  );
}
