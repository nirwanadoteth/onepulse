"use client";

import { memo, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEnsBasenameResolver } from "@/hooks/use-ens-basename-resolver";

import { GMTransaction } from "./gm-transaction";
import { validateRecipient } from "./recipient-validation";
import { useFocusTrap } from "./use-focus-trap";
import { useModalScrollPrevention } from "./use-modal-scroll-prevention";

type GMModalProps = {
  isOpen: boolean;
  chainId: number;
  contractAddress: `0x${string}`;
  isSponsored: boolean;
  isContractReady: boolean;
  processing: boolean;
  chainBtnClasses: string;
  address?: string;
  refetchLastGmDay?: () => Promise<unknown>;
  onClose: () => void;
  setProcessing: (value: boolean) => void;
};

export const GMModal = memo(
  ({
    isOpen,
    chainId,
    contractAddress,
    isSponsored,
    isContractReady,
    processing,
    chainBtnClasses,
    address,
    refetchLastGmDay,
    onClose,
    setProcessing,
  }: GMModalProps) => {
    const [mode, setMode] = useState<"main" | "gmTo">("main");
    const [recipient, setRecipient] = useState("");

    const handleClose = useCallback(() => {
      setMode("main");
      setRecipient("");
      setProcessing(false);
      onClose();
    }, [setProcessing, onClose]);

    const handleBackdropClick = useCallback(() => {
      if (!processing) {
        handleClose();
      }
    }, [processing, handleClose]);

    const dialogRef = useFocusTrap({
      isOpen,
      isProcessing: processing,
      onCloseAction: handleClose,
    });

    useModalScrollPrevention(isOpen);

    if (!isOpen) {
      return null;
    }

    return (
      <div
        aria-labelledby={`gm-dialog-title-${chainId}`}
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        ref={dialogRef}
        role="dialog"
      >
        <button
          aria-label="Close modal"
          className="absolute inset-0 bg-black/40"
          onClick={handleBackdropClick}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              handleBackdropClick();
            }
          }}
          type="button"
        />
        <Card className="relative z-10 w-[95%] max-w-sm" tabIndex={-1}>
          {mode === "main" ? (
            <MainMode
              address={address}
              chainBtnClasses={chainBtnClasses}
              chainId={chainId}
              contractAddress={contractAddress}
              isContractReady={isContractReady}
              isSponsored={isSponsored}
              onClose={handleClose}
              onSwitchToGmTo={() => setMode("gmTo")}
              processing={processing}
              refetchLastGmDay={refetchLastGmDay}
              setProcessing={setProcessing}
            />
          ) : (
            <GmToMode
              address={address}
              chainBtnClasses={chainBtnClasses}
              chainId={chainId}
              contractAddress={contractAddress}
              isContractReady={isContractReady}
              isSponsored={isSponsored}
              onBack={() => {
                setMode("main");
                setRecipient("");
              }}
              onClose={handleClose}
              processing={processing}
              recipient={recipient}
              refetchLastGmDay={refetchLastGmDay}
              setProcessing={setProcessing}
              setRecipient={setRecipient}
            />
          )}
        </Card>
      </div>
    );
  }
);

type MainModeProps = {
  chainId: number;
  contractAddress: `0x${string}`;
  isSponsored: boolean;
  isContractReady: boolean;
  processing: boolean;
  chainBtnClasses: string;
  address?: string;
  refetchLastGmDay?: () => Promise<unknown>;
  onClose: () => void;
  setProcessing: (value: boolean) => void;
  onSwitchToGmTo: () => void;
};

const MainMode = memo(
  ({
    chainId,
    contractAddress,
    isSponsored,
    isContractReady,
    processing,
    chainBtnClasses,
    address,
    refetchLastGmDay,
    onClose,
    setProcessing,
    onSwitchToGmTo,
  }: MainModeProps) => (
    <>
      <CardHeader>
        <CardTitle
          className="text-center text-lg"
          id={`gm-dialog-title-${chainId}`}
        >
          Choose GM Type
        </CardTitle>
      </CardHeader>
      <CardFooter className="flex-col gap-2">
        <GMTransaction
          address={address}
          buttonLabel="GM"
          chainBtnClasses={chainBtnClasses}
          chainId={chainId}
          contractAddress={contractAddress}
          isContractReady={isContractReady}
          isSponsored={isSponsored}
          onClose={onClose}
          processing={processing}
          refetchLastGmDay={refetchLastGmDay}
          setProcessing={setProcessing}
          transactionType="gm"
        />{" "}
        <Button
          aria-disabled={!isContractReady || processing}
          className={`w-full ${chainBtnClasses}`}
          disabled={!isContractReady || processing}
          onClick={onSwitchToGmTo}
        >
          GM to a Fren
        </Button>
        <Button
          aria-disabled={processing}
          className="w-full"
          disabled={processing}
          onClick={onClose}
          variant="outline"
        >
          Cancel
        </Button>
      </CardFooter>
    </>
  )
);

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

type InputFeedbackProps = {
  sanitizedRecipient: string;
  isRecipientValid: boolean;
  isResolving: boolean;
  resolvedAddress: string | null;
  recipient: string;
};

const shouldShowResolvingMessage = (isResolving: boolean): boolean =>
  isResolving;

const shouldShowErrorMessage = (
  sanitizedRecipient: string,
  isRecipientValid: boolean,
  isResolving: boolean
): boolean =>
  sanitizedRecipient.length > 0 && !isRecipientValid && !isResolving;

const InputFeedback = memo(
  ({
    sanitizedRecipient,
    isRecipientValid,
    isResolving,
    recipient,
  }: InputFeedbackProps) => {
    if (shouldShowResolvingMessage(isResolving)) {
      return (
        <p className="mt-2 text-blue-500 text-sm">Resolving {recipient}...</p>
      );
    }

    if (
      shouldShowErrorMessage(sanitizedRecipient, isRecipientValid, isResolving)
    ) {
      return (
        <p
          className="mt-2 text-red-500 text-sm"
          id="recipient-error"
          role="alert"
        >
          Enter a valid address or ENS/Basename.
        </p>
      );
    }

    return null;
  }
);

type ActionButtonsProps = {
  isRecipientValid: boolean;
  isContractReady: boolean;
  processing: boolean;
  sanitizedRecipient: string;
  chainBtnClasses: string;
  chainId: number;
  contractAddress: `0x${string}`;
  isSponsored: boolean;
  resolvedAddress: string | null;
  recipient: string;
  address?: string;
  refetchLastGmDay?: () => Promise<unknown>;
  onClose: () => void;
  setProcessing: (value: boolean) => void;
  onBack: () => void;
};

const isPlaceholderButtonDisabled = (
  sanitizedRecipient: string,
  isContractReady: boolean,
  processing: boolean
): boolean => !(sanitizedRecipient && isContractReady) || processing;

const ActionButtons = memo(
  ({
    isRecipientValid,
    isContractReady,
    processing,
    sanitizedRecipient,
    chainBtnClasses,
    chainId,
    contractAddress,
    isSponsored,
    resolvedAddress,
    recipient,
    address,
    refetchLastGmDay,
    onClose,
    setProcessing,
    onBack,
  }: ActionButtonsProps) => (
    <>
      {isRecipientValid ? (
        <GMTransaction
          address={address}
          buttonLabel="Send GM"
          chainBtnClasses={chainBtnClasses}
          chainId={chainId}
          contractAddress={contractAddress}
          isContractReady={isContractReady}
          isSponsored={isSponsored}
          onClose={onClose}
          processing={processing}
          recipient={resolvedAddress || recipient}
          refetchLastGmDay={refetchLastGmDay}
          setProcessing={setProcessing}
          transactionType="gmTo"
        />
      ) : (
        <Button
          className={`w-full ${chainBtnClasses}`}
          disabled={isPlaceholderButtonDisabled(
            sanitizedRecipient,
            isContractReady,
            processing
          )}
        >
          Enter a valid address
        </Button>
      )}
      <Button
        aria-disabled={processing}
        className="w-full"
        disabled={processing}
        onClick={onBack}
        variant="outline"
      >
        Back
      </Button>
    </>
  )
);

const GmToMode = memo(
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
    const sanitizedRecipient = recipient.trim();
    const isRecipientValid = validateRecipient(recipient);

    const { address: resolvedAddress, isLoading: isResolving } =
      useEnsBasenameResolver(recipient);

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
            resolvedAddress={resolvedAddress}
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
