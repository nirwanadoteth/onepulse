"use client"

import React from "react"
import {
  Transaction,
  TransactionButton,
  TransactionSponsor,
} from "@coinbase/onchainkit/transaction"
import { isAddress, type Address } from "viem"

import { dailyGMAbi } from "@/lib/abi/daily-gm"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { ProcessingMirror } from "@/components/gm-chain-card/processing-mirror"
import { SuccessReporter } from "@/components/gm-chain-card/success-reporter"
import { TransactionToast } from "@/components/transaction-toast"

type TransactionStatus = "default" | "success" | "error" | "pending"

interface GMTransactionProps {
  chainId: number
  contractAddress: `0x${string}`
  isSponsored: boolean
  isContractReady: boolean
  processing: boolean
  chainBtnClasses: string
  buttonLabel: string
  transactionType: "gm" | "gmTo"
  recipient?: string
  address?: string
  refetchLastGmDay?: () => Promise<unknown>
  onClose: () => void
  setProcessing: (value: boolean) => void
}

export const GMTransaction = React.memo(function GMTransaction({
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
}: GMTransactionProps) {
  const getCalls = () => {
    if (transactionType === "gm") {
      return [
        {
          abi: dailyGMAbi,
          address: contractAddress,
          functionName: "gm" as const,
        },
      ]
    }

    // gmTo requires valid recipient
    const hasValidRecipient = recipient && isAddress(recipient)
    if (transactionType !== "gmTo" || !hasValidRecipient) {
      return []
    }

    return [
      {
        abi: dailyGMAbi,
        address: contractAddress,
        functionName: "gmTo" as const,
        args: [recipient as Address],
      },
    ]
  }

  const calls = getCalls()

  if (!calls.length) return null

  return (
    <Transaction isSponsored={isSponsored} chainId={chainId} calls={calls}>
      <TransactionButton
        disabled={!isContractReady || processing}
        render={({
          onSubmit,
          isDisabled,
          status,
        }: {
          onSubmit: () => void
          isDisabled: boolean
          status: TransactionStatus
        }) => {
          return (
            <>
              <ProcessingMirror status={status} onChange={setProcessing} />
              <Button
                onClick={onSubmit}
                disabled={isDisabled}
                className={`w-full ${chainBtnClasses}`}
                aria-busy={status === "pending"}
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
                status={String(status)}
                onReported={onClose}
                address={address}
                refetchLastGmDay={refetchLastGmDay}
                chainId={chainId}
              />
            </>
          )
        }}
      />
      {isSponsored && <TransactionSponsor />}
      <TransactionToast />
    </Transaction>
  )
})
