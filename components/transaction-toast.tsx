import { useTransactionContext } from "@coinbase/onchainkit/transaction";
import { type ReactNode, type RefObject, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  ERROR_MESSAGES,
  LOADING_MESSAGES,
  SUCCESS_MESSAGES,
} from "@/lib/error-handling";
import { cn, getChainExplorer } from "@/lib/utils";

function useSafeTransactionContext() {
  const context = useTransactionContext();
  try {
    return context;
  } catch {
    return {
      errorMessage: undefined,
      isLoading: false,
      isToastVisible: false,
      receipt: undefined,
      transactionHash: undefined,
      transactionId: undefined,
      onSubmit: undefined,
      chainId: undefined,
      lifecycleStatus: { statusName: "init" },
    } as unknown as ReturnType<typeof useTransactionContext>;
  }
}

function getTransactionState(params: {
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

function createSuccessAction(
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

function createErrorAction(onSubmit: (() => void) | undefined): ReactNode {
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

function useToastVisibility(
  state: string,
  errorMessage: string | undefined,
  toastCreatedRef: RefObject<boolean>
) {
  useEffect(() => {
    if (state === "hidden" && toastCreatedRef.current && !errorMessage) {
      toast.dismiss();
      toastCreatedRef.current = false;
    }
  }, [state, errorMessage, toastCreatedRef]);
}

function useToastCreation(options: {
  state: string;
  txChainId?: number;
  errorMessage: string | undefined;
  onSubmit: (() => void) | undefined;
  txHashRef: RefObject<string | undefined>;
  toastCreatedRef: RefObject<boolean>;
  toastControllerRef: RefObject<{
    resolve?: (value: { name: string }) => void;
    reject?: (reason?: unknown) => void;
  }>;
}) {
  const {
    state,
    txChainId,
    errorMessage,
    onSubmit,
    txHashRef,
    toastCreatedRef,
    toastControllerRef,
  } = options;

  useEffect(() => {
    if (state === "loading" && !toastCreatedRef.current) {
      const transactionPromise = new Promise<{ name: string }>(
        (resolve, reject) => {
          toastControllerRef.current.resolve = resolve;
          toastControllerRef.current.reject = reject;
        }
      );

      toast.promise(transactionPromise, {
        loading: LOADING_MESSAGES.TRANSACTION_PENDING,
        success: () => ({
          message: SUCCESS_MESSAGES.TRANSACTION_SUCCESS,
          action: createSuccessAction(txHashRef.current, txChainId),
        }),
        error: () => ({
          message: errorMessage || ERROR_MESSAGES.TRANSACTION_FAILED,
          action: createErrorAction(onSubmit),
        }),
      });

      toastCreatedRef.current = true;
    }
  }, [
    state,
    txChainId,
    errorMessage,
    onSubmit,
    toastControllerRef,
    toastCreatedRef,
    txHashRef,
  ]);
}

function useToastResolution(
  state: string,
  errorMessage: string | undefined,
  toastCreatedRef: RefObject<boolean>,
  toastControllerRef: RefObject<{
    resolve?: (value: { name: string }) => void;
    reject?: (reason?: unknown) => void;
  }>
) {
  useEffect(() => {
    if (!toastCreatedRef.current) {
      return;
    }

    if (state === "success") {
      toastControllerRef.current.resolve?.({ name: "Transaction" });
      toastCreatedRef.current = false;
    } else if (state === "error") {
      toastControllerRef.current.reject?.(
        new Error(errorMessage || "Unknown error")
      );
      toastCreatedRef.current = false;
    }
  }, [state, errorMessage, toastCreatedRef, toastControllerRef]);
}

export function TransactionToast() {
  const context = useSafeTransactionContext();
  const {
    errorMessage,
    isLoading,
    isToastVisible,
    receipt,
    transactionHash,
    transactionId,
    onSubmit,
    chainId: contextChainId,
  } = context;

  // Prefer the transaction's own chainId from context; do not rely on global selection
  const txChainId =
    typeof contextChainId === "number" && contextChainId > 0
      ? contextChainId
      : undefined;

  const toastCreatedRef = useRef<boolean>(false);
  const toastControllerRef = useRef<{
    resolve?: (value: { name: string }) => void;
    reject?: (reason?: unknown) => void;
  }>({});
  const txHashRef = useRef<string | undefined>(transactionHash);

  const state = getTransactionState({
    isToastVisible,
    isLoading,
    receipt,
    errorMessage,
    transactionId,
    transactionHash,
  });

  // Keep transaction hash in sync
  useEffect(() => {
    txHashRef.current = transactionHash;
  }, [transactionHash]);

  useToastVisibility(state, errorMessage, toastCreatedRef);
  useToastCreation({
    state,
    txChainId,
    errorMessage,
    onSubmit,
    txHashRef,
    toastCreatedRef,
    toastControllerRef,
  });
  useToastResolution(state, errorMessage, toastCreatedRef, toastControllerRef);

  return null;
}
