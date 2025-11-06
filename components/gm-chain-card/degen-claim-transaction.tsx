"use client"

import React, { useCallback, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useAccount, useChainId } from "wagmi"

import { getDailyRewardsAddress } from "@/lib/constants"
import { performClaimFlow } from "@/lib/degen-claim"
import {
  useClaimEligibility,
  useDegenClaimSignature,
} from "@/hooks/use-degen-claim"
import { Particles } from "@/components/ui/particles"
import { ShinyButton } from "@/components/ui/shiny-button"
import { Spinner } from "@/components/ui/spinner"

// wagmiConfig is used in lib/degen-claim

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

// (moved to lib/degen-claim.ts)

function getClaimButtonLabel(
  isConnected: boolean,
  eligibility: {
    canClaim: boolean
    hasAlreadyClaimed: boolean
    hasSentGMToday: boolean
  },
  isSigning: boolean,
  status: ClaimStatus
): string {
  if (!isConnected) return "Connect Wallet"
  if (eligibility.hasAlreadyClaimed) return "Already Claimed"
  if (!eligibility.hasSentGMToday) return "Send GM First"
  if (!eligibility.canClaim) return "Not Eligible"
  if (isSigning) return "Sign Transaction"
  if (status === "confirming") return "Processing..."
  if (status === "success") return "Claimed!"
  return "Claim Rewards"
}

// useClaimState and useClaimHandler are implemented inside the hook below to
// keep top-level module complexity low.

function useClaimSetup(fid: bigint | undefined, chainId: number) {
  const contractAddress = getDailyRewardsAddress(chainId)
  const { generateSignature, isSigning, isNoncePending, nonce } =
    useDegenClaimSignature({ fid })
  const {
    canClaim,
    reward,
    claimStatus,
    hasSentGMToday,
    refetch: refetchEligibility,
  } = useClaimEligibility({ fid })

  return {
    contractAddress,
    generateSignature,
    isSigning,
    isNoncePending,
    nonce,
    canClaim,
    reward,
    claimStatus,
    hasSentGMToday,
    refetchEligibility,
  }
}

function useClaimDisabledState(conditions: {
  disabled: boolean
  isConnected: boolean
  canClaim: boolean
  hasSentGMToday: boolean
  hasAddress: boolean
  hasFid: boolean
  hasContract: boolean
  isLoading: boolean
}) {
  const isNotConnected = !conditions.isConnected
  const missingPrereqs =
    !conditions.canClaim ||
    !conditions.hasSentGMToday ||
    !conditions.hasAddress ||
    !conditions.hasFid ||
    !conditions.hasContract

  return (
    conditions.disabled ||
    isNotConnected ||
    missingPrereqs ||
    conditions.isLoading
  )
}

export const DegenClaimTransaction = React.memo(function DegenClaimTransaction({
  fid,
  onSuccess,
  onError,
  disabled = false,
}: DegenClaimTransactionProps) {
  const hook = useDegenClaimTransaction({ fid, onSuccess, onError, disabled })

  return (
    <div className="w-full">
      <ShinyButton
        onClick={hook.handleClaim}
        disabled={hook.effectiveDisabled}
        className={`w-full font-medium transition-all duration-200 ${
          hook.claimState.status === "success"
            ? "bg-green-600 text-white hover:bg-green-700"
            : hook.effectiveDisabled
              ? "cursor-not-allowed bg-muted text-muted-foreground"
              : "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        }`}
        aria-busy={hook.isLoading}
      >
        {hook.isLoading && <Spinner />}
        {hook.isNoncePending
          ? "Loading..."
          : !hook.isSignatureReady
            ? "Preparing..."
            : hook.buttonLabel}
      </ShinyButton>
      {hook.claimState.error && (
        <div className="mt-3 rounded-md border border-red-200 bg-red-50/50 p-3 dark:border-red-800 dark:bg-red-950/20">
          <div className="flex items-start gap-2 text-red-700 dark:text-red-300">
            <span className="text-sm">⚠️</span>
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Claim Failed</p>
              <p className="text-xs opacity-90">{hook.claimState.error}</p>
            </div>
          </div>
        </div>
      )}
      {hook.claimState.status === "success" && hook.claimState.txHash && (
        <div className="mt-3 rounded-md border border-green-200 bg-green-50/50 p-3 dark:border-green-800 dark:bg-green-950/20">
          <div className="flex items-start gap-2 text-green-700 dark:text-green-300">
            <span className="text-sm">✓</span>
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Claimed Successfully</p>
              <p className="text-xs opacity-90">
                Received {(Number(hook.reward) / 1e18).toFixed(0)} DEGEN
              </p>
            </div>
          </div>
        </div>
      )}
      {hook.claimState.status === "success" && (
        <Particles className="pointer-events-none absolute inset-0 -z-10" />
      )}
    </div>
  )
})

function useDegenClaimTransaction({
  fid,
  onSuccess,
  onError,
  disabled = false,
}: DegenClaimTransactionProps & { disabled?: boolean }) {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const queryClient = useQueryClient()
  const {
    contractAddress,
    generateSignature,
    isSigning,
    isNoncePending,
    nonce,
    canClaim,
    reward,
    claimStatus,
    hasSentGMToday,
    refetchEligibility,
  } = useClaimSetup(fid, chainId)
  // Local hook state and handler are created inside this hook to reduce module-level
  // complexity; these mirror the previous top-level utilities.
  const [status, setStatus] = useState<ClaimStatus>("idle")
  const [error, setError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)

  const resetState = useCallback(() => {
    setStatus("idle")
    setTxHash(null)
  }, [])

  const isLoading = isSigning || status === "confirming" || isNoncePending

  const hasAddress = !!address
  const hasFid = !!fid
  const hasContract = !!contractAddress

  const isDisabled = useClaimDisabledState({
    disabled,
    isConnected,
    canClaim,
    hasSentGMToday,
    hasAddress,
    hasFid,
    hasContract,
    isLoading,
  })

  // If nonce is not yet available we should prevent signing to avoid
  // the "Missing required parameters for signature" runtime error.
  const isSignatureReady = nonce !== undefined && nonce !== null
  const effectiveDisabled = isDisabled || !isSignatureReady

  const handleClaim = useCallback(() => {
    const handler = createHandleClaim({
      address,
      fid,
      contractAddress,
      generateSignature,
      refetchEligibility,
      queryClient,
      setStatus,
      setError,
      setTxHash,
      resetState,
      onSuccess,
      onError,
    })

    // Call the handler; errors are handled inside createHandleClaim
    void handler()
  }, [
    address,
    fid,
    contractAddress,
    generateSignature,
    refetchEligibility,
    queryClient,
    onSuccess,
    onError,
    resetState,
  ])

  const buttonLabel = getClaimButtonLabel(
    isConnected,
    {
      canClaim,
      hasAlreadyClaimed:
        (claimStatus?.claimerClaimedToday || claimStatus?.fidClaimedToday) ??
        false,
      hasSentGMToday,
    },
    isSigning,
    status
  )

  return {
    handleClaim,
    effectiveDisabled,
    isLoading,
    isNoncePending,
    isSignatureReady,
    buttonLabel,
    claimState: { status, error, txHash, resetState },
    reward,
  }
}

// Factory that produces a claim handler function. The heavy logic is moved
// here so the hook itself remains small and easier to test.
function createHandleClaim(opts: {
  address?: string
  fid?: bigint
  contractAddress?: string
  generateSignature: (
    fid: bigint
  ) => Promise<{ signature: `0x${string}`; deadline: bigint }>
  refetchEligibility: () => void
  queryClient: ReturnType<typeof useQueryClient>
  setStatus: (s: ClaimStatus) => void
  setError: (e: string | null) => void
  setTxHash: (h: string | null) => void
  resetState: () => void
  onSuccess?: (txHash: string) => void
  onError?: (err: Error) => void
}) {
  return () => {
    const {
      address,
      fid,
      contractAddress,
      generateSignature,
      refetchEligibility,
      queryClient,
      setStatus,
      setError,
      setTxHash,
      resetState,
      onSuccess,
      onError,
    } = opts

    const validation = validateClaimInputs(address, fid, contractAddress || "")
    if (!validation.isValid) {
      const e = new Error(validation.error || "Invalid claim parameters")
      setStatus("error")
      setError(e.message)
      onError?.(e)
      return Promise.reject(e)
    }

    setStatus("signing")
    setError(null)
    setTxHash(null)

    setStatus("confirming")
    return performClaimFlow(
      address as `0x${string}`,
      fid!,
      contractAddress as `0x${string}`,
      generateSignature,
      refetchEligibility,
      queryClient
    )
      .then((hash) => {
        setTxHash(hash as `0x${string}`)
        setStatus("success")
        onSuccess?.(hash as string)
        setTimeout(resetState, 2000)
        return hash
      })
      .catch((err) => {
        const e = err instanceof Error ? err : new Error(String(err))
        setStatus("error")
        setError(e.message)
        onError?.(e)
        console.error("Claim error:", e)
        throw e
      })
  }
}
