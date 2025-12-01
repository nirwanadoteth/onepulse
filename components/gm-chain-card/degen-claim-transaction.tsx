import {
  Transaction,
  TransactionButton,
} from "@coinbase/onchainkit/transaction";
import { ClaimFallbackUI } from "./claim-fallback-ui";
import { DegenActionButton } from "./degen-action-button";
import { useDegenClaimTransactionLogic } from "./use-degen-claim-transaction-logic";

type DegenClaimTransactionProps = {
  fid: bigint | undefined;
  sponsored: boolean;
  onSuccess?: (txHash: string) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
};

export function DegenClaimTransaction({
  fid,
  sponsored,
  onSuccess,
  onError,
  disabled = false,
}: DegenClaimTransactionProps) {
  const {
    numericChainId,
    getClaimContracts,
    onStatus,
    isDisabled,
    buttonState,
  } = useDegenClaimTransactionLogic({
    fid,
    sponsored,
    onSuccess,
    onError,
    disabled,
  });

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
        className="w-full"
        disabled={isDisabled}
        text={buttonState.label}
      />
      <DegenActionButton state={buttonState} />
    </Transaction>
  );
}
