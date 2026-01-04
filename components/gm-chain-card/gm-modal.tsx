"use client";

import type { Address } from "viem/accounts";
import { Card } from "@/components/ui/card";
import type { ChainId } from "@/lib/constants";
import { GmToMode } from "./gm-to-mode";
import { MainMode } from "./main-mode";
import { useGMModalLogic } from "./use-gm-modal-logic";

type GMModalProps = {
  isOpen: boolean;
  chainId: ChainId;
  contractAddress: Address;
  isSponsored: boolean;
  isContractReady: boolean;
  processing: boolean;
  chainBtnClasses: string;
  address: `0x${string}`;
  refetchLastGmDayAction?: () => Promise<unknown>;
  onCloseAction: () => void;
  setProcessingAction: (value: boolean) => void;
};

export function GMModal({
  isOpen,
  chainId,
  contractAddress,
  isSponsored,
  isContractReady,
  processing,
  chainBtnClasses,
  address,
  refetchLastGmDayAction,
  onCloseAction,
  setProcessingAction,
}: GMModalProps) {
  const {
    mode,
    setMode,
    recipient,
    setRecipient,
    handleClose,
    handleBackdropClick,
    dialogRef,
  } = useGMModalLogic({
    isOpen,
    processing,
    onClose: onCloseAction,
    setProcessing: setProcessingAction,
  });

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
            onCloseAction={handleClose}
            onSwitchToGmToAction={() => setMode("gmTo")}
            processing={processing}
            refetchLastGmDayAction={refetchLastGmDayAction}
            setProcessingAction={setProcessingAction}
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
            refetchLastGmDay={refetchLastGmDayAction}
            setProcessing={setProcessingAction}
            setRecipient={setRecipient}
          />
        )}
      </Card>
    </div>
  );
}
