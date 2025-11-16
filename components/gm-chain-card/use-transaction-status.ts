import type { LifecycleStatus } from "@coinbase/onchainkit/transaction";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { ERROR_MESSAGES, handleError } from "@/lib/error-handling";

type UseTransactionStatusProps = {
  onSuccess?: (txHash: string) => void;
  onError?: (error: Error) => void;
  refetchEligibility: () => Promise<unknown> | undefined;
};

/**
 * Hook to handle transaction lifecycle status updates.
 * Manages cache invalidation and callbacks for success/error states.
 *
 * Ensures eligibility is refreshed and queries are invalidated before
 * calling onSuccess, so the modal opens with fresh data.
 */
export function useTransactionStatus({
  onSuccess,
  onError,
  refetchEligibility,
}: UseTransactionStatusProps) {
  const queryClient = useQueryClient();

  return useCallback(
    async (status: LifecycleStatus) => {
      const isSuccess = status.statusName === "success";
      const isError = status.statusName === "error";

      if (isSuccess) {
        // Await eligibility refresh to ensure fresh data before opening modal
        await Promise.all([
          Promise.resolve(refetchEligibility()),
          queryClient.invalidateQueries({ queryKey: ["useReadContract"] }),
        ]);

        const txHash =
          status.statusData.transactionReceipts[0]?.transactionHash;
        if (txHash && onSuccess) {
          onSuccess(txHash);
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
    [refetchEligibility, queryClient, onSuccess, onError]
  );
}
