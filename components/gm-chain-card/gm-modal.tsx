"use client"

import React, { useCallback } from "react"

import { useEnsBasenameResolver } from "@/hooks/use-ens-basename-resolver"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { GMTransaction } from "./gm-transaction"
import { validateRecipient } from "./recipient-validation"
import { useFocusTrap } from "./use-focus-trap"
import { useModalScrollPrevention } from "./use-modal-scroll-prevention"

interface GMModalProps {
  isOpen: boolean
  chainId: number
  contractAddress: `0x${string}`
  isSponsored: boolean
  isContractReady: boolean
  processing: boolean
  chainBtnClasses: string
  address?: string
  refetchLastGmDay?: () => Promise<unknown>
  onClose: () => void
  setProcessing: (value: boolean) => void
}

export const GMModal = React.memo(function GMModal({
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
}: GMModalProps) {
  const [mode, setMode] = React.useState<"main" | "gmTo">("main")
  const [recipient, setRecipient] = React.useState("")

  const handleClose = useCallback(() => {
    setMode("main")
    setRecipient("")
    setProcessing(false)
    onClose()
  }, [setProcessing, onClose])

  const handleBackdropClick = useCallback(() => {
    if (!processing) handleClose()
  }, [processing, handleClose])

  const dialogRef = useFocusTrap({
    isOpen,
    isProcessing: processing,
    onClose: handleClose,
  })

  useModalScrollPrevention(isOpen)

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`gm-dialog-title-${chainId}`}
      ref={dialogRef}
    >
      <div
        className="absolute inset-0 bg-black/40"
        onClick={handleBackdropClick}
      />
      <Card className="relative z-10 w-[95%] max-w-sm" tabIndex={-1}>
        {mode === "main" ? (
          <MainMode
            chainId={chainId}
            contractAddress={contractAddress}
            isSponsored={isSponsored}
            isContractReady={isContractReady}
            processing={processing}
            chainBtnClasses={chainBtnClasses}
            address={address}
            refetchLastGmDay={refetchLastGmDay}
            onClose={handleClose}
            setProcessing={setProcessing}
            onSwitchToGmTo={() => setMode("gmTo")}
          />
        ) : (
          <GmToMode
            chainId={chainId}
            contractAddress={contractAddress}
            isSponsored={isSponsored}
            isContractReady={isContractReady}
            processing={processing}
            chainBtnClasses={chainBtnClasses}
            recipient={recipient}
            setRecipient={setRecipient}
            address={address}
            refetchLastGmDay={refetchLastGmDay}
            onClose={handleClose}
            setProcessing={setProcessing}
            onBack={() => {
              setMode("main")
              setRecipient("")
            }}
          />
        )}
      </Card>
    </div>
  )
})

// Sub-components for cleaner code

interface MainModeProps {
  chainId: number
  contractAddress: `0x${string}`
  isSponsored: boolean
  isContractReady: boolean
  processing: boolean
  chainBtnClasses: string
  address?: string
  refetchLastGmDay?: () => Promise<unknown>
  onClose: () => void
  setProcessing: (value: boolean) => void
  onSwitchToGmTo: () => void
}

const MainMode = React.memo(function MainMode({
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
}: MainModeProps) {
  return (
    <>
      <CardHeader>
        <CardTitle
          id={`gm-dialog-title-${chainId}`}
          className="text-center text-lg"
        >
          Choose GM Type
        </CardTitle>
      </CardHeader>
      <CardFooter className="flex-col gap-2">
        <GMTransaction
          chainId={chainId}
          contractAddress={contractAddress}
          isSponsored={isSponsored}
          isContractReady={isContractReady}
          processing={processing}
          chainBtnClasses={chainBtnClasses}
          buttonLabel="GM"
          transactionType="gm"
          address={address}
          refetchLastGmDay={refetchLastGmDay}
          onClose={onClose}
          setProcessing={setProcessing}
        />{" "}
        <Button
          disabled={!isContractReady || processing}
          onClick={onSwitchToGmTo}
          className={`w-full ${chainBtnClasses}`}
          aria-disabled={!isContractReady || processing}
        >
          GM to a Fren
        </Button>
        <Button
          variant="outline"
          onClick={onClose}
          className="w-full"
          disabled={processing}
          aria-disabled={processing}
        >
          Cancel
        </Button>
      </CardFooter>
    </>
  )
})

interface GmToModeProps {
  chainId: number
  contractAddress: `0x${string}`
  isSponsored: boolean
  isContractReady: boolean
  processing: boolean
  chainBtnClasses: string
  recipient: string
  setRecipient: (value: string) => void
  address?: string
  refetchLastGmDay?: () => Promise<unknown>
  onClose: () => void
  setProcessing: (value: boolean) => void
  onBack: () => void
}

interface InputFeedbackProps {
  sanitizedRecipient: string
  isRecipientValid: boolean
  isResolving: boolean
  resolvedAddress: string | null
  recipient: string
}

const shouldShowResolvingMessage = (isResolving: boolean): boolean =>
  isResolving

const shouldShowErrorMessage = (
  sanitizedRecipient: string,
  isRecipientValid: boolean,
  isResolving: boolean
): boolean => sanitizedRecipient.length > 0 && !isRecipientValid && !isResolving

const InputFeedback = React.memo(function InputFeedback({
  sanitizedRecipient,
  isRecipientValid,
  isResolving,
  recipient,
}: InputFeedbackProps) {
  if (shouldShowResolvingMessage(isResolving)) {
    return (
      <p className="mt-2 text-sm text-blue-500">Resolving {recipient}...</p>
    )
  }

  if (
    shouldShowErrorMessage(sanitizedRecipient, isRecipientValid, isResolving)
  ) {
    return (
      <p
        id="recipient-error"
        className="mt-2 text-sm text-red-500"
        role="alert"
      >
        Enter a valid address or ENS/Basename.
      </p>
    )
  }

  return null
})

interface ActionButtonsProps {
  isRecipientValid: boolean
  isContractReady: boolean
  processing: boolean
  sanitizedRecipient: string
  chainBtnClasses: string
  chainId: number
  contractAddress: `0x${string}`
  isSponsored: boolean
  resolvedAddress: string | null
  recipient: string
  address?: string
  refetchLastGmDay?: () => Promise<unknown>
  onClose: () => void
  setProcessing: (value: boolean) => void
  onBack: () => void
}

const isPlaceholderButtonDisabled = (
  sanitizedRecipient: string,
  isContractReady: boolean,
  processing: boolean
): boolean => !sanitizedRecipient || !isContractReady || processing

const ActionButtons = React.memo(function ActionButtons({
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
}: ActionButtonsProps) {
  return (
    <>
      {isRecipientValid ? (
        <GMTransaction
          chainId={chainId}
          contractAddress={contractAddress}
          isSponsored={isSponsored}
          isContractReady={isContractReady}
          processing={processing}
          chainBtnClasses={chainBtnClasses}
          buttonLabel="Send GM"
          transactionType="gmTo"
          recipient={resolvedAddress || recipient}
          address={address}
          refetchLastGmDay={refetchLastGmDay}
          onClose={onClose}
          setProcessing={setProcessing}
        />
      ) : (
        <Button
          disabled={isPlaceholderButtonDisabled(
            sanitizedRecipient,
            isContractReady,
            processing
          )}
          className={`w-full ${chainBtnClasses}`}
        >
          Enter a valid address
        </Button>
      )}
      <Button
        variant="outline"
        onClick={onBack}
        disabled={processing}
        className="w-full"
        aria-disabled={processing}
      >
        Back
      </Button>
    </>
  )
})

const GmToMode = React.memo(function GmToMode({
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
}: GmToModeProps) {
  const sanitizedRecipient = recipient.trim()
  const isRecipientValid = validateRecipient(recipient)

  // Resolve ENS/Basename to address
  const { address: resolvedAddress, isLoading: isResolving } =
    useEnsBasenameResolver(recipient)

  return (
    <>
      <CardHeader>
        <CardTitle
          id={`gm-dialog-title-${chainId}`}
          className="text-center text-lg"
        >
          Fren&#39;s Address
        </CardTitle>
      </CardHeader>
      <CardContent>
        <input
          type="text"
          placeholder="0x... or nirwana.eth"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          disabled={processing}
          className="w-full rounded-md border bg-transparent px-3 py-2"
          aria-label="Recipient wallet address"
          aria-invalid={sanitizedRecipient !== "" && !isRecipientValid}
          aria-describedby={
            sanitizedRecipient !== "" && !isRecipientValid
              ? "recipient-error"
              : undefined
          }
          autoComplete="off"
          spellCheck={false}
          autoCapitalize="none"
          autoCorrect="off"
          inputMode="text"
          autoFocus
        />
        <InputFeedback
          sanitizedRecipient={sanitizedRecipient}
          isRecipientValid={isRecipientValid}
          isResolving={isResolving}
          resolvedAddress={resolvedAddress}
          recipient={recipient}
        />
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <ActionButtons
          isRecipientValid={isRecipientValid}
          isContractReady={isContractReady}
          processing={processing}
          sanitizedRecipient={sanitizedRecipient}
          chainBtnClasses={chainBtnClasses}
          chainId={chainId}
          contractAddress={contractAddress}
          isSponsored={isSponsored}
          resolvedAddress={resolvedAddress}
          recipient={recipient}
          address={address}
          refetchLastGmDay={refetchLastGmDay}
          onClose={onClose}
          setProcessing={setProcessing}
          onBack={onBack}
        />
      </CardFooter>
    </>
  )
})
