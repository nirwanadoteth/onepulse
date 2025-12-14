"use client";

import { useOpenUrl } from "@coinbase/onchainkit/minikit";
import { type RefObject, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  ERROR_MESSAGES,
  LOADING_MESSAGES,
  SUCCESS_MESSAGES,
} from "@/lib/error-handling";
import { useSafeTransactionContext } from "./use-safe-transaction-context";
import {
  createErrorAction,
  createSuccessAction,
  getTransactionState,
} from "./utils";

type UseTransactionToastParams = {
  className?: string;
  position?: "top-center" | "bottom-center";
  label?: string;
  onStatusChangeAction?: (status: string) => void;
};

const TRANSACTION_TOAST_DURATION_MS = 5000;

function updateToastState(
  state: string,
  toastId: RefObject<string | number | null>,
  params: {
    className?: string;
    label?: string;
    position?: "top-center" | "bottom-center";
    transactionHash?: string;
    chainId?: number;
    errorMessage?: string;
    onSubmit?: () => void;
    openUrl?: ((url: string) => void) | null;
  }
) {
  const {
    className,
    label,
    position,
    transactionHash,
    chainId,
    errorMessage,
    onSubmit,
    openUrl,
  } = params;

  if (state === "hidden") {
    if (toastId.current) {
      toast.dismiss(toastId.current);
      toastId.current = null;
    }
    return;
  }

  if (state === "loading" && toastId.current) {
    return;
  }

  if (toastId.current) {
    toast.dismiss(toastId.current);
  }

  if (state === "success") {
    toastId.current = toast.success(SUCCESS_MESSAGES.TRANSACTION_SUCCESS, {
      className,
      description: label,
      action: createSuccessAction(transactionHash, chainId, openUrl || null),
      position,
      duration: TRANSACTION_TOAST_DURATION_MS,
    });
  } else if (state === "error") {
    toastId.current = toast.error(errorMessage || ERROR_MESSAGES.UNKNOWN, {
      className,
      action: createErrorAction(onSubmit),
      position,
      duration: TRANSACTION_TOAST_DURATION_MS,
    });
  } else if (state === "loading") {
    toastId.current = toast.loading(LOADING_MESSAGES.TRANSACTION_PENDING, {
      className,
      position,
    });
  }
}

export function useTransactionToast({
  className,
  position = "top-center",
  label,
  onStatusChangeAction,
}: UseTransactionToastParams) {
  const openUrl = useOpenUrl();
  const {
    errorMessage,
    isLoading,
    isToastVisible,
    receipt,
    transactionHash,
    transactionId,
    onSubmit,
    chainId,
  } = useSafeTransactionContext();

  const toastId = useRef<string | number | null>(null);

  useEffect(() => {
    const state = getTransactionState({
      isToastVisible,
      isLoading,
      receipt,
      errorMessage,
      transactionId,
      transactionHash,
    });

    if (onStatusChangeAction) {
      onStatusChangeAction(state);
    }

    updateToastState(state, toastId, {
      className,
      label,
      position,
      transactionHash,
      chainId,
      errorMessage,
      onSubmit,
      openUrl,
    });
  }, [
    isToastVisible,
    isLoading,
    receipt,
    errorMessage,
    transactionId,
    transactionHash,
    onSubmit,
    chainId,
    className,
    label,
    position,
    onStatusChangeAction,
    openUrl,
  ]);
}
