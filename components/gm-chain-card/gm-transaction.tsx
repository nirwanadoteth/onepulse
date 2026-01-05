"use client";

import { ProcessingMirror } from "@/components/gm-chain-card/processing-mirror";
import { SuccessReporter } from "@/components/gm-chain-card/success-reporter";
import { Button } from "@/components/ui/button";
import {
  Transaction,
  TransactionButton,
} from "@/components/ui/custom-transaction";
import { Spinner } from "@/components/ui/spinner";
import type { ChainId } from "@/lib/constants";
import { useGMTransactionLogic } from "./use-gm-transaction-logic";

type GMTransactionProps = {
  chainId: ChainId;
  contractAddress: `0x${string}`;
  isSponsored: boolean;
  isContractReady: boolean;
  processing: boolean;
  chainBtnClasses: string;
  buttonLabel: string;
  address: `0x${string}`;
  setProcessingAction: (value: boolean) => void;
};

export function GMTransaction({
  chainId,
  contractAddress,
  isSponsored,
  isContractReady,
  processing,
  chainBtnClasses,
  buttonLabel,
  address,
  setProcessingAction,
}: GMTransactionProps) {
  const { calls, hasCalls } = useGMTransactionLogic({
    contractAddress,
  });

  if (!hasCalls) {
    return null;
  }

  return (
    <Transaction calls={calls} chainId={chainId} isSponsored={isSponsored}>
      <TransactionButton
        disabled={!isContractReady || processing}
        renderAction={({ onSubmit, isDisabled, status, context }) => (
          <>
            <ProcessingMirror onChange={setProcessingAction} status={status} />
            <Button
              aria-busy={status === "pending"}
              className={`w-full ${chainBtnClasses}`}
              disabled={isDisabled}
              onClick={onSubmit}
              size="lg"
            >
              {status === "pending" ? (
                <>
                  <Spinner />
                  Processing...
                </>
              ) : (
                buttonLabel
              )}
            </Button>
            <SuccessReporter
              address={address}
              chainId={chainId}
              status={status}
              txHash={context?.transactionHash}
            />
          </>
        )}
      />
    </Transaction>
  );
}
