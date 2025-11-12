import { useTransactionContext } from "@coinbase/onchainkit/transaction";
import { type ReactNode, type RefObject, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useChainId } from "wagmi";

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
  accountChainId: number
): ReactNode {
  if (!txHash) {
    return null;
  }
  const chainExplorer = getChainExplorer(accountChainId);
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
  accountChainId: number;
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
    accountChainId,
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
        loading: "Processing transaction...",
        success: () => ({
          message: "Transaction successful",
          action: createSuccessAction(txHashRef.current, accountChainId),
        }),
        error: () => ({
          message: errorMessage || "Something went wrong",
          action: createErrorAction(onSubmit),
        }),
      });

      toastCreatedRef.current = true;
    }
  }, [
    state,
    accountChainId,
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
  } = context;

  const accountChainId = useChainId();

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
    accountChainId,
    errorMessage,
    onSubmit,
    txHashRef,
    toastCreatedRef,
    toastControllerRef,
  });
  useToastResolution(state, errorMessage, toastCreatedRef, toastControllerRef);

  return null;
}
