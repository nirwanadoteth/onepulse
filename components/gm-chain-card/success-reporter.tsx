"use client";

import { memo } from "react";
import type { TransactionStatus } from "@/types/transaction";
import { useSuccessReporterLogic } from "./use-success-reporter-logic";

type SuccessReporterProps = {
  status: TransactionStatus;
  onReported?: () => void;
  address?: string;
  refetchLastGmDay?: () => Promise<unknown>;
  chainId: number;
  txHash?: string;
};

export const SuccessReporter = memo(
  ({
    status,
    onReported,
    address,
    refetchLastGmDay,
    chainId,
    txHash,
  }: SuccessReporterProps) => {
    useSuccessReporterLogic({
      status,
      onReported,
      address,
      refetchLastGmDay,
      chainId,
      txHash,
    });

    return null;
  }
);
