"use client"

import React, { useCallback, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useAccount, useChainId } from "wagmi"
import { waitForTransactionReceipt, writeContract } from "wagmi/actions"

import { dailyRewardsAbi } from "@/lib/abi/daily-rewards"
import { getDailyRewardsAddress } from "@/lib/constants"
import {
  useClaimEligibility,
  useDegenClaimSignature,
} from "@/hooks/use-degen-claim"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { config as wagmiConfig } from "@/components/providers/wagmi-provider"

interface DegenClaimTransactionProps {
  fid: bigint | undefined
  onSuccess?: (txHash: string) => void
  onError?: (error: Error) => void
  disabled?: boolean
}

type ClaimStatus = "idle" | "signing" | "confirming" | "success" | "error"

function validateClaimInputs(
  address: string | undefined,
  fid: bigint | undefined,
  contractAddress: string
): { isValid: boolean; error?: string } {
  if (!address) return { isValid: false, error: "Address not available" }
  if (!fid) return { isValid: false, error: "FID not provided" }
  if (!contractAddress)
    return { isValid: false, error: "Contract address not configured" }
  return { isValid: true }
}

async function executeClaimTransaction(
  address: `0x${string}`,
  contractAddress: `0x${string}`,
  fid: bigint,
  signature: `0x${string}`,
  deadline: bigint
) {
  return writeContract(wagmiConfig, {
    address: contractAddress,
    abi: dailyRewardsAbi,
    functionName: "claim",
    args: [fid, deadline, signature],
    account: address,
    chain: undefined,
  })
}

async function reportClaimToBackend(
  address: `0x${string}`,
  fid: bigint,
  txHash: `0x${string}`
) {
  try {
    await fetch("/api/claims/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        address,
        fid: Number(fid),
        txHash,
      }),
    })
  } catch (err) {
    console.error("Failed to report claim:", err)
  }
}

function getClaimButtonLabel(
  isConnected: boolean,
  canClaim: boolean,
  isSigning: boolean,
  status: ClaimStatus
): string {
  if (!isConnected) return "Connect Wallet"
  if (!canClaim) return "Not Eligible"
  if (isSigning) return "Sign Transaction"
  if (status === "confirming") return "Processing..."
  if (status === "success") return "Claimed!"
  return "Claim Rewards"
}

function useClaimState() {
  const [status, setStatus] = useState<ClaimStatus>("idle")
  const [error, setError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)

  const resetState = () => {
    setStatus("idle")
    setTxHash(null)
  }

  return { status, error, setError, txHash, setTxHash, setStatus, resetState }
}

function useClaimHandler(
  address: string | undefined,
  fid: bigint | undefined,
  contractAddress: `0x${string}` | "",
  generateSignature: (
    fid: bigint
  ) => Promise<{ signature: `0x${string}`; deadline: bigint }>,
  refetchEligibility: () => void,
  queryClient: ReturnType<typeof useQueryClient>,
  {
    onSuccess,
    onError,
  }: { onSuccess?: (txHash: string) => void; onError?: (error: Error) => void },
  {
    setStatus,
    setError,
    setTxHash,
    resetState,
  }: ReturnType<typeof useClaimState>
) {
  return useCallback(async () => {
    try {
      const validation = validateClaimInputs(address, fid, contractAddress)
      if (!validation.isValid) {
        throw new Error(validation.error || "Invalid claim parameters")
      }

      setStatus("signing")
      setError(null)
      setTxHash(null)

      const { signature, deadline } = await generateSignature(fid!)
      setStatus("confirming")

      const hash = await executeClaimTransaction(
        address as `0x${string}`,
        contractAddress as `0x${string}`,
        fid!,
        signature,
        deadline
      )

      setTxHash(hash)
      await waitForTransactionReceipt(wagmiConfig, { hash, confirmations: 1 })
      await reportClaimToBackend(
        address as `0x${string}`,
        fid!,
        hash as `0x${string}`
      )

      refetchEligibility()
      queryClient.invalidateQueries({ queryKey: ["useReadContract"] })

      setStatus("success")
      onSuccess?.(hash)
      setTimeout(resetState, 2000)
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setStatus("error")
      setError(error.message)
      onError?.(error)
      console.error("Claim error:", error)
    }
  }, [
    address,
    fid,
    contractAddress,
    generateSignature,
    refetchEligibility,
    queryClient,
    onSuccess,
    onError,
    setStatus,
    setError,
    setTxHash,
    resetState,
  ])
}

function useClaimSetup(fid: bigint | undefined, chainId: number) {
  const contractAddress = getDailyRewardsAddress(chainId)
  const { generateSignature, isSigning, isNoncePending } = useDegenClaimSignature({ fid })
  const {
    canClaim,
    reward,
    refetch: refetchEligibility,
  } = useClaimEligibility({ fid })

  return {
    contractAddress,
    generateSignature,
    isSigning,
    isNoncePending,
    canClaim,
    reward,
    refetchEligibility,
  }
}

function useClaimDisabledState(conditions: {
  disabled: boolean
  isConnected: boolean
  canClaim: boolean
  hasAddress: boolean
  hasFid: boolean
  hasContract: boolean
  isLoading: boolean
}) {
  return (
    conditions.disabled ||
    !conditions.isConnected ||
    !conditions.canClaim ||
    !conditions.hasAddress ||
    !conditions.hasFid ||
    !conditions.hasContract ||
    conditions.isLoading
  )
}

export const DegenClaimTransaction = React.memo(function DegenClaimTransaction({
  fid,
  onSuccess,
  onError,
  disabled = false,
}: DegenClaimTransactionProps) {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const queryClient = useQueryClient()
  const claimState = useClaimState()
  const {
    contractAddress,
    generateSignature,
    isSigning,
    isNoncePending,
    canClaim,
    reward,
    refetchEligibility,
  } = useClaimSetup(fid, chainId)

  const isLoading = isSigning || claimState.status === "confirming" || isNoncePending
  const isDisabled = useClaimDisabledState({
    disabled,
    isConnected,
    canClaim,
    hasAddress: !!address,
    hasFid: !!fid,
    hasContract: !!contractAddress,
    isLoading,
  })

  const handleClaim = useClaimHandler(
    address,
    fid,
    contractAddress,
    generateSignature,
    refetchEligibility,
    queryClient,
    { onSuccess, onError },
    claimState
  )

  const buttonLabel = getClaimButtonLabel(
    isConnected,
    canClaim,
    isSigning,
    claimState.status
  )

  return (
    <div className="w-full">
      <Button
        onClick={handleClaim}
        disabled={isDisabled}
        className="w-full"
        variant={claimState.status === "success" ? "default" : "default"}
        aria-busy={isLoading}
      >
        {isLoading && <Spinner />}
        {isNoncePending ? "Loading..." : buttonLabel}
      </Button>
      {claimState.error && (
        <p className="text-destructive mt-2 text-sm">{claimState.error}</p>
      )}
      {claimState.status === "success" && claimState.txHash && (
        <p className="mt-2 text-sm text-green-600">
          Claimed {(Number(reward) / 1e18).toFixed(2)} DEGEN
        </p>
      )}
    </div>
  )
})
