import type { LifecycleStatus } from "@coinbase/onchainkit/transaction";
import { useCallback, useRef } from "react";
import { toast } from "sonner";
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
}: UseTransactionStatusProps): TransactionStatusHandlers {
  const processedTxHashes = useRef<Set<string>>(new Set());

  const handleRefreshAfterSuccess = useCallback(
    async (txHash: string) => {
      try {
        // Refetch eligibility to update claim state from on-chain contract
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
    [refetchEligibility, onSuccess, onRefreshError]
  );

  const onStatus = useCallback(
    (status: LifecycleStatus) => {
      const isSuccess = status.statusName === "success";
      const isError = status.statusName === "error";
      const isPending = status.statusName === "transactionPending";

      if (isPending) {
        toast.loading("Processing...", {
          id: "reward-claim-pending",
        });
      }

      if (isSuccess) {
        toast.dismiss("reward-claim-pending");
        const txHash =
          status.statusData.transactionReceipts?.[0]?.transactionHash;
        if (txHash && !processedTxHashes.current.has(txHash)) {
          processedTxHashes.current.add(txHash);
          // Fire and forget - handleRefreshAfterSuccess runs async without blocking
          handleRefreshAfterSuccess(txHash);
        }
      }

      if (isError) {
        toast.dismiss("reward-claim-pending");
        if (onError) {
          const error = new Error(
            status.statusData.message || ERROR_MESSAGES.CLAIM_FAILED
          );
          handleError(error, ERROR_MESSAGES.CLAIM_FAILED, {
            operation: "reward-claim",
            statusData: status.statusData,
          });
          onError(error);
        }
      }
    },
    [handleRefreshAfterSuccess, onError]
  );

  return { onStatus, handleRefreshAfterSuccess };
}
