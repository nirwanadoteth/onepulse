"use client";

import { memo } from "react";
import { Card } from "@/components/ui/card";

import { GmToMode } from "./gm-to-mode";
import { MainMode } from "./main-mode";
import { useGMModalLogic } from "./use-gm-modal-logic";

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
      onClose,
      setProcessing,
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

GMModal.displayName = "GMModal";
