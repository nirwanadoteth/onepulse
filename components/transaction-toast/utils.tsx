import { ExternalLinkIcon, RotateCcwIcon } from "lucide-react";
import type { ReactNode } from "react";
import { getChainExplorer } from "@/lib/utils";

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
  txChainId: number | undefined,
  openUrl: ((url: string) => void) | null
): ReactNode {
  if (!txHash) {
    return null;
  }
  if (!openUrl) {
    return null;
  }
  const isValidChain = typeof txChainId === "number" && txChainId > 0;
  if (!isValidChain) {
    return null;
  }
  const chainExplorer = getChainExplorer();

  return (
    <button
      className="ml-auto"
      onClick={() => openUrl(`${chainExplorer}/tx/${txHash}`)}
      type="button"
    >
      <ExternalLinkIcon className="size-4 stroke-3 text-green-600" />
    </button>
  );
}

export function createErrorAction(
  onSubmit: (() => void) | undefined
): ReactNode {
  if (!onSubmit) {
    return null;
  }
  return (
    <button className="ml-auto align-middle" onClick={onSubmit} type="button">
      <RotateCcwIcon className="size-4 stroke-3 text-red-600" />
    </button>
  );
}
