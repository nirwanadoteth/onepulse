"use client";

import { memo } from "react";
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ActionButtons } from "./action-buttons";
import { InputFeedback } from "./input-feedback";
import { useGmToModeLogic } from "./use-gm-to-mode-logic";

type GmToModeProps = {
  chainId: number;
  contractAddress: `0x${string}`;
  isSponsored: boolean;
  isContractReady: boolean;
  processing: boolean;
  chainBtnClasses: string;
  recipient: string;
  setRecipient: (value: string) => void;
  address?: string;
  refetchLastGmDay?: () => Promise<unknown>;
  onClose: () => void;
  setProcessing: (value: boolean) => void;
  onBack: () => void;
};

export const GmToMode = memo(
  ({
    chainId,
    contractAddress,
    isSponsored,
    isContractReady,
    processing,
    chainBtnClasses,
    recipient,
    setRecipient,
    address,
    refetchLastGmDay,
    onClose,
    setProcessing,
    onBack,
  }: GmToModeProps) => {
    const {
      sanitizedRecipient,
      isRecipientValid,
      resolvedAddress,
      isResolving,
    } = useGmToModeLogic({ recipient });

    return (
      <>
        <CardHeader>
          <CardTitle
            className="text-center text-lg"
            id={`gm-dialog-title-${chainId}`}
          >
            Fren&#39;s Address
          </CardTitle>
        </CardHeader>
        <CardContent>
          <input
            aria-describedby={
              sanitizedRecipient !== "" && !isRecipientValid
                ? "recipient-error"
                : undefined
            }
            aria-invalid={sanitizedRecipient !== "" && !isRecipientValid}
            aria-label="Recipient wallet address"
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect="off"
            autoFocus
            className="w-full rounded-md border bg-transparent px-3 py-2"
            disabled={processing}
            inputMode="text"
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x... or nirwana.eth"
            spellCheck={false}
            type="text"
            value={recipient}
          />
          <InputFeedback
            isRecipientValid={isRecipientValid}
            isResolving={isResolving}
            recipient={recipient}
            sanitizedRecipient={sanitizedRecipient}
          />
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <ActionButtons
            address={address}
            chainBtnClasses={chainBtnClasses}
            chainId={chainId}
            contractAddress={contractAddress}
            isContractReady={isContractReady}
            isRecipientValid={isRecipientValid}
            isSponsored={isSponsored}
            onBack={onBack}
            onClose={onClose}
            processing={processing}
            recipient={recipient}
            refetchLastGmDay={refetchLastGmDay}
            resolvedAddress={resolvedAddress}
            sanitizedRecipient={sanitizedRecipient}
            setProcessing={setProcessing}
          />
        </CardFooter>
      </>
    );
  }
);
