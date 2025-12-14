import type { LifecycleStatus } from "@coinbase/onchainkit/transaction";
import { useCallback, useRef } from "react";
import { ERROR_MESSAGES, handleError } from "@/lib/error-handling";

type UseTransactionStatusProps = {
  onSuccess?: (txHash: string) => void;
  onError?: (error: Error) => void;
  onRefreshError?: (error: Error) => void;
  refetchEligibility?: () => Promise<unknown>;
  claimer?: string;
};

type TransactionStatusHandlers = {
  onStatus: (status: LifecycleStatus) => void;
  handleRefreshAfterSuccess: (txHash: string) => Promise<void>;
};

/**
 * Hook to handle transaction lifecycle status updates.
 * Returns a synchronous onStatus callback for OnchainKit and a separate
 * async handler for refreshing eligibility after success.
 *
 * Only refreshes the eligibility query when transaction succeeds,
 * avoiding unnecessary invalidation of unrelated queries.
 */
export function useTransactionStatus({
  onSuccess,
  onError,
  onRefreshError,
  refetchEligibility,
  claimer,
}: UseTransactionStatusProps): TransactionStatusHandlers {
  const processedTxHashes = useRef<Set<string>>(new Set());

  const confirmClaimOnBackend = useCallback(
    async (txHash: string) => {
      if (!claimer) {
        return;
      }
      try {
        const response = await fetch("/api/claims/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transactionHash: txHash,
            claimer,
          }),
        });
        if (!response.ok) {
          handleError(
            new Error(`Backend confirmation failed: ${response.status}`),
            ERROR_MESSAGES.CLAIM_FAILED,
            {
              operation: "claims/confirm",
              status: response.status,
            },
            { silent: true }
          );
        }
      } catch (error) {
        handleError(
          error,
          ERROR_MESSAGES.CLAIM_FAILED,
          {
            operation: "claims/confirm",
            txHash,
          },
          { silent: true }
        );
      }
    },
    [claimer]
  );

  const handleRefreshAfterSuccess = useCallback(
    async (txHash: string) => {
      try {
        // Confirm claim was successful on-chain and increment counter
        await confirmClaimOnBackend(txHash);

        // Only refetch eligibility - no need to invalidate broad query keys
        if (refetchEligibility) {
          await refetchEligibility();
        }
      } catch (error) {
        if (onRefreshError) {
          onRefreshError(
            error instanceof Error ? error : new Error(String(error))
          );
        }
      } finally {
        if (onSuccess) {
          onSuccess(txHash);
        }
      }
    },
    [refetchEligibility, onSuccess, onRefreshError, confirmClaimOnBackend]
  );

  const onStatus = useCallback(
    (status: LifecycleStatus) => {
      const isSuccess = status.statusName === "success";
      const isError = status.statusName === "error";

      if (isSuccess) {
        const txHash =
          status.statusData.transactionReceipts?.[0]?.transactionHash;
        if (txHash && !processedTxHashes.current.has(txHash)) {
          processedTxHashes.current.add(txHash);
          // Fire and forget - handleRefreshAfterSuccess runs async without blocking
          handleRefreshAfterSuccess(txHash);
        }
      }

      if (isError && onError) {
        const error = new Error(
          status.statusData.message || ERROR_MESSAGES.CLAIM_FAILED
        );
        handleError(error, ERROR_MESSAGES.CLAIM_FAILED, {
          operation: "degen-claim",
          statusData: status.statusData,
        });
        onError(error);
      }
    },
    [handleRefreshAfterSuccess, onError]
  );

  return { onStatus, handleRefreshAfterSuccess };
}
