import { useCallback } from "react"
import type { LifecycleStatus } from "@coinbase/onchainkit/transaction"
import { useQueryClient } from "@tanstack/react-query"

interface UseTransactionStatusProps {
  onSuccess?: (txHash: string) => void
  onError?: (error: Error) => void
  refetchEligibility: () => void
}

/**
 * Hook to handle transaction lifecycle status updates.
 * Manages cache invalidation and callbacks for success/error states.
 */
export function useTransactionStatus({
  onSuccess,
  onError,
  refetchEligibility,
}: UseTransactionStatusProps) {
  const queryClient = useQueryClient()

  return useCallback(
    (status: LifecycleStatus) => {
      console.log("Transaction status:", status)

      const isSuccess = status.statusName === "success"
      const isError = status.statusName === "error"

      if (isSuccess) {
        refetchEligibility()
        queryClient.invalidateQueries({ queryKey: ["useReadContract"] })
        const txHash = status.statusData.transactionReceipts[0]?.transactionHash
        if (txHash && onSuccess) onSuccess(txHash)
      }

      if (isError && onError) {
        const error = new Error(
          status.statusData.message || "Transaction failed"
        )
        onError(error)
      }
    },
    [refetchEligibility, queryClient, onSuccess, onError]
  )
}
