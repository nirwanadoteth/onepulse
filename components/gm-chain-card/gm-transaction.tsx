"use client";

import {
  Transaction,
  TransactionButton,
  TransactionSponsor,
} from "@coinbase/onchainkit/transaction";
import { memo } from "react";
import type { Address } from "viem";
import { ProcessingMirror } from "@/components/gm-chain-card/processing-mirror";
import { SuccessReporter } from "@/components/gm-chain-card/success-reporter";
import { TransactionToast } from "@/components/transaction-toast";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useGMTransactionLogic } from "./use-gm-transaction-logic";

type GMTransactionProps = {
  chainId: number;
  contractAddress: Address;
  isSponsored: boolean;
  isContractReady: boolean;
  processing: boolean;
  chainBtnClasses: string;
  buttonLabel: string;
  transactionType: "gm" | "gmTo";
  recipient?: string;
  address?: string;
  refetchLastGmDay?: () => Promise<unknown>;
  onClose: () => void;
  setProcessing: (value: boolean) => void;
};

export const GMTransaction = memo(
  ({
    chainId,
    contractAddress,
    isSponsored,
    isContractReady,
    processing,
    chainBtnClasses,
    buttonLabel,
    transactionType,
    recipient,
    address,
    refetchLastGmDay,
    onClose,
    setProcessing,
  }: GMTransactionProps) => {
    const { calls, hasCalls } = useGMTransactionLogic({
      contractAddress,
      transactionType,
      recipient,
    });

    if (!hasCalls) {
      return null;
    }

    return (
      <Transaction calls={calls} chainId={chainId} isSponsored={isSponsored}>
        <TransactionButton
          disabled={!isContractReady || processing}
          render={({ onSubmit, isDisabled, status, context }) => (
            <>
              <ProcessingMirror onChange={setProcessing} status={status} />
              <Button
                aria-busy={status === "pending"}
                className={`w-full ${chainBtnClasses}`}
                disabled={isDisabled}
                onClick={onSubmit}
              >
                {status === "pending" ? (
                  <>
                    <Spinner />
                    {transactionType === "gm" ? "Processing..." : "Sending..."}
                  </>
                ) : (
                  buttonLabel
                )}
              </Button>
              <SuccessReporter
                address={address}
                chainId={chainId}
                onReported={onClose}
                refetchLastGmDay={refetchLastGmDay}
                status={status}
                txHash={context?.transactionHash}
              />
            </>
          )}
        />
        {isSponsored && <TransactionSponsor />}
        <TransactionToast />
      </Transaction>
    );
  }
);
