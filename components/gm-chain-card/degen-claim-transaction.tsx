import {
  Transaction,
  TransactionButton,
} from "@coinbase/onchainkit/transaction";
import { ActionButton } from "./action-button";
import { ClaimFallbackUI } from "./claim-fallback-ui";
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
    return <ClaimFallbackUI />;
  }

  return (
    <Transaction
      chainId={numericChainId}
      contracts={getClaimContracts}
      isSponsored={sponsored}
      onStatus={onStatus}
    >
      <TransactionButton
        className="w-full"
        disabled={isDisabled}
        text={buttonState.text}
      />
      <ActionButton
        className="w-full"
        disabled={isDisabled}
        state={buttonState}
      />
    </Transaction>
  );
}
