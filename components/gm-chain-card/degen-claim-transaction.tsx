import React from "react"
import {
  Transaction,
  TransactionButton,
  TransactionSponsor,
} from "@coinbase/onchainkit/transaction"
import { useAccount, useChainId } from "wagmi"

import { getDailyRewardsAddress } from "@/lib/constants"
import { useClaimEligibility } from "@/hooks/use-degen-claim"

import { TransactionToast } from "../transaction-toast"
import { ClaimFallbackUI } from "./claim-fallback-ui"
import { getButtonState } from "./get-button-state"
import { useClaimContracts } from "./use-claim-contracts"
import { useTransactionStatus } from "./use-transaction-status"

interface DegenClaimTransactionProps {
  fid: bigint | undefined
  sponsored: boolean
  onSuccess?: (txHash: string) => void
  onError?: (error: Error) => void
  disabled?: boolean
}

/**
 * Component for claiming daily DEGEN rewards using OnchainKit Transaction with sponsorship.
 * Backend signs the claim authorization, user submits sponsored transaction.
 */
export const DegenClaimTransaction = React.memo(function DegenClaimTransaction({
  fid,
  sponsored,
  onSuccess,
  onError,
  disabled = false,
}: DegenClaimTransactionProps) {
  const { address } = useAccount()
  const chainId = useChainId()
  const contractAddress = getDailyRewardsAddress(chainId)
  const {
    canClaim,
    hasSentGMToday,
    isPending: isEligibilityPending,
    refetch: refetchEligibility,
  } = useClaimEligibility({ fid })

  const getClaimContracts = useClaimContracts({
    address,
    fid,
    contractAddress,
  })

  // Handle transaction status updates
  const handleStatus = useTransactionStatus({
    onSuccess,
    onError,
    refetchEligibility,
  })

  const isDisabled =
    disabled ||
    !address ||
    !fid ||
    !contractAddress ||
    !canClaim ||
    !hasSentGMToday ||
    isEligibilityPending

  // Determine button state and fallback UI
  const buttonState = getButtonState(
    Boolean(address),
    isEligibilityPending,
    hasSentGMToday,
    canClaim
  )

  if (buttonState.showFallback) {
    return <ClaimFallbackUI type={buttonState.showFallback} />
  }

  return (
    <div className="relative w-full">
      <Transaction
        chainId={chainId}
        calls={getClaimContracts}
        onStatus={handleStatus}
        isSponsored={sponsored}
      >
        <TransactionButton
          disabled={isDisabled}
          className="w-full"
          text={buttonState.label}
        />
        {sponsored && <TransactionSponsor />}
        <TransactionToast />
      </Transaction>
    </div>
  )
})
