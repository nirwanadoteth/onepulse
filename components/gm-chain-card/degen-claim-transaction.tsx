import React, { useCallback } from "react"
import {
  Transaction,
  TransactionButton,
  TransactionSponsor,
} from "@coinbase/onchainkit/transaction"
import type { LifecycleStatus } from "@coinbase/onchainkit/transaction"
import { useQueryClient } from "@tanstack/react-query"
import type { ContractFunctionParameters } from "viem"
import { useAccount, useChainId, useSignMessage, useReadContract } from "wagmi"
import { encodePacked, keccak256 } from "viem"

import { dailyRewardsAbi } from "@/lib/abi/daily-rewards"
import { getDailyRewardsAddress } from "@/lib/constants"
import { useClaimDeadline, useClaimEligibility } from "@/hooks/use-degen-claim"

import { TransactionToast } from "../transaction-toast"

interface DegenClaimTransactionProps {
  fid: bigint | undefined
  onSuccess?: (txHash: string) => void
  onError?: (error: Error) => void
  disabled?: boolean
}

/**
 * Component for claiming daily DEGEN rewards using OnchainKit Transaction with sponsorship.
 * User signs their own claim message and submits sponsored transaction.
 */
export const DegenClaimTransaction = React.memo(function DegenClaimTransaction({
  fid,
  onSuccess,
  onError,
  disabled = false,
}: DegenClaimTransactionProps) {
  const { address } = useAccount()
  const chainId = useChainId()
  const queryClient = useQueryClient()
  const contractAddress = getDailyRewardsAddress(chainId)
  const deadline = useClaimDeadline()
  const { signMessageAsync } = useSignMessage()
  const {
    canClaim,
    hasSentGMToday,
    isPending: isEligibilityPending,
    refetch: refetchEligibility,
  } = useClaimEligibility({ fid })

  // Read the current nonce for the user (will need updated ABI after contract deployment)
  const { data: nonceData } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: dailyRewardsAbi,
    functionName: "nonces",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!contractAddress,
    },
  })

  const nonce = nonceData ? BigInt(nonceData.toString()) : 0n

  // User signs their own claim message with nonce
  const getClaimContracts = useCallback(async (): Promise<
    ContractFunctionParameters[]
  > => {
    if (!address || !fid || !contractAddress) {
      throw new Error("Missing required parameters")
    }

    // Create the message hash that matches the contract's expectation
    // Format: keccak256(abi.encodePacked(claimer, fid, nonce, deadline, contractAddress))
    const messageHash = keccak256(
      encodePacked(
        ["address", "uint256", "uint256", "uint256", "address"],
        [address, fid, BigInt(nonce.toString()), deadline, contractAddress]
      )
    )

    // Sign the message with the user's wallet
    const signature = await signMessageAsync({
      message: { raw: messageHash },
    })

    // Return contract call with user's signature and nonce
    return [
      {
        address: contractAddress as `0x${string}`,
        abi: dailyRewardsAbi,
        functionName: "claim",
        args: [address, fid, nonce, deadline, signature as `0x${string}`],
      },
    ]
  }, [address, fid, nonce, contractAddress, deadline, signMessageAsync])

  const handleStatus = useCallback(
    (status: LifecycleStatus) => {
      console.log("Transaction status:", status)

      if (status.statusName === "success") {
        // Refetch eligibility after successful claim
        refetchEligibility()
        queryClient.invalidateQueries({ queryKey: ["useReadContract"] })

        // Call success callback
        const txHash = status.statusData.transactionReceipts[0]?.transactionHash
        if (txHash && onSuccess) {
          onSuccess(txHash)
        }
      } else if (status.statusName === "error") {
        // Call error callback
        if (onError) {
          const error = new Error(
            status.statusData.message || "Transaction failed"
          )
          onError(error)
        }
      }
    },
    [refetchEligibility, queryClient, onSuccess, onError]
  )

  const isDisabled =
    disabled ||
    !address ||
    !fid ||
    !contractAddress ||
    !canClaim ||
    !hasSentGMToday ||
    isEligibilityPending

  if (!address) {
    return (
      <div className="border-border bg-muted text-muted-foreground w-full rounded-lg border p-4 text-center text-sm">
        Connect your wallet to claim rewards
      </div>
    )
  }

  if (!hasSentGMToday) {
    return (
      <div className="border-border bg-muted text-muted-foreground w-full rounded-lg border p-4 text-center text-sm">
        Send GM first to claim rewards
      </div>
    )
  }

  return (
    <div className="relative w-full">
      <Transaction
        chainId={chainId}
        calls={getClaimContracts}
        onStatus={handleStatus}
        isSponsored={true}
      >
        <TransactionButton
          disabled={isDisabled}
          className="w-full"
          text="Claim Rewards"
        />
        <TransactionSponsor />
        <TransactionToast />
      </Transaction>
    </div>
  )
})
