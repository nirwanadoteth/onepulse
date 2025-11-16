"use client";

import { useCallback, useState } from "react";
import {
  type ERROR_MESSAGES,
  handleError,
  handleSuccess,
  type LOADING_MESSAGES,
  type SUCCESS_MESSAGES,
  showLoading,
} from "@/lib/error-handling";

type MessageKeys<T> = T extends Record<string, infer V> ? V : never;

type UseAsyncOperationOptions = {
  loadingMessage?: MessageKeys<typeof LOADING_MESSAGES> | string;
  successMessage?: MessageKeys<typeof SUCCESS_MESSAGES> | string;
  errorMessage: MessageKeys<typeof ERROR_MESSAGES> | string;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
  context?: Record<string, unknown>;
};

type UseAsyncOperationReturn<T> = {
  execute: () => Promise<T | undefined>;
  isLoading: boolean;
  error: unknown | null;
  reset: () => void;
};

/**
 * Executes an async operation with standardized loading/success/error toasts.
 *
 * @remarks
 * To avoid unnecessary re-renders, ensure `operation` is memoized with useCallback
 * and `options` is either memoized with useMemo or declared outside the component.
 *
 * @example
 * // Memoize operation
 * const operation = useCallback(() => disconnectWallet(), []);
 *
 * // Declare options outside component or memoize
 * const opts = useMemo(() => ({
 *   loadingMessage: LOADING_MESSAGES.WALLET_DISCONNECTING,
 *   successMessage: SUCCESS_MESSAGES.WALLET_DISCONNECTED,
 *   errorMessage: ERROR_MESSAGES.WALLET_DISCONNECT,
 *   onSuccess: onSuccessHandler,
 *   onError: onErrorHandler,
 *   context: ctx,
 * }), [onSuccessHandler, onErrorHandler, ctx]);
 *
 * const { execute, isLoading } = useAsyncOperation(
 *   operation,
 *   opts
 * );
 */
export function useAsyncOperation<T>(
  operation: () => Promise<T>,
  options: UseAsyncOperationOptions
): UseAsyncOperationReturn<T> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);

  // Destructure options so we can list granular dependencies
  const {
    loadingMessage,
    successMessage,
    errorMessage,
    onSuccess,
    onError,
    context,
  } = options;

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    let dismissLoading: (() => void) | undefined;

    try {
      if (loadingMessage) {
        dismissLoading = showLoading(loadingMessage);
      }

      const result = await operation();

      if (dismissLoading) {
        dismissLoading();
      }

      if (successMessage) {
        handleSuccess(successMessage);
      }

      onSuccess?.();
      return result;
    } catch (err) {
      if (dismissLoading) {
        dismissLoading();
      }

      setError(err);
      handleError(err, errorMessage, {
        operation: "async-operation",
        ...context,
      });

      onError?.(err);
    } finally {
      setIsLoading(false);
    }
  }, [
    operation,
    loadingMessage,
    successMessage,
    errorMessage,
    onSuccess,
    onError,
    context,
  ]);

  const reset = useCallback(() => {
    setError(null);
    setIsLoading(false);
  }, []);

  return { execute, isLoading, error, reset };
}
