import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useMiniAppContext } from "@/components/providers/miniapp-provider";
import { handleError } from "@/lib/error-handling";
import type { TransactionStatus } from "@/types/transaction";
import { performGmReporting } from "./gm-reporting-utils";

type UseSuccessReporterLogicProps = {
  status: TransactionStatus;
  onReported?: () => void;
  address?: string;
  refetchLastGmDay?: () => Promise<unknown>;
  chainId: number;
  txHash?: string;
};

export const useSuccessReporterLogic = ({
  status,
  onReported,
  address,
  refetchLastGmDay,
  chainId,
  txHash,
}: UseSuccessReporterLogicProps) => {
  const didReport = useRef(false);
  const queryClient = useQueryClient();
  const miniAppContextData = useMiniAppContext();
  const user = miniAppContextData?.context?.user;

  useEffect(() => {
    if (status !== "success" || !address || didReport.current) {
      return;
    }

    didReport.current = true;

    performGmReporting({
      address,
      chainId,
      txHash,
      user,
      queryClient,
      refetchLastGmDay,
      onReported,
    }).catch((error) => {
      handleError(
        error,
        "GM reporting failed",
        {
          operation: "gm/reporting",
          address,
          chainId,
          txHash,
        },
        { silent: true }
      );
      didReport.current = false; // Allow retry on next success
    });
  }, [
    status,
    address,
    onReported,
    queryClient,
    refetchLastGmDay,
    chainId,
    txHash,
    user,
  ]);
};
