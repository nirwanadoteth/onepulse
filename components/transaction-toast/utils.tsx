import type { ReactNode } from "react";
import { cn, getChainExplorer } from "@/lib/utils";

export function getTransactionState(params: {
  isToastVisible: boolean;
  isLoading: boolean;
  receipt: unknown;
  errorMessage: string | undefined;
  transactionId: string | undefined;
  transactionHash: string | undefined;
}) {
  const {
    isToastVisible,
    isLoading,
    receipt,
    errorMessage,
    transactionId,
    transactionHash,
  } = params;
  if (!isToastVisible) {
    return "hidden";
  }
  if (receipt) {
    return "success";
  }
  if (errorMessage) {
    return "error";
  }
  if (isLoading || transactionId || transactionHash) {
    return "loading";
  }
  return "idle";
}

export function createSuccessAction(
  txHash: string | undefined,
  txChainId: number | undefined
): ReactNode {
  const isValidChain = typeof txChainId === "number" && txChainId > 0;
  if (!txHash) {
    return null;
  }
  if (!isValidChain) {
    return null;
  }
  const chainExplorer = getChainExplorer(txChainId);
  return (
    <a
      className="ml-auto"
      href={`${chainExplorer}/tx/${txHash}`}
      rel="noopener noreferrer"
      target="_blank"
    >
      <span
        className={cn("font-ock font-semibold text-sm", "text-ock-primary")}
      >
        View transaction
      </span>
    </a>
  );
}

export function createErrorAction(
  onSubmit: (() => void) | undefined
): ReactNode {
  if (!onSubmit) {
    return null;
  }
  return (
    <button className="ml-auto" onClick={onSubmit} type="button">
      <span
        className={cn("font-ock font-semibold text-sm", "text-ock-primary")}
      >
        Try again
      </span>
    </button>
  );
}
