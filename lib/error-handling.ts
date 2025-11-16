import { toast } from "sonner";

/**
 * User-facing error messages for common operations
 * Optimized for mobile: 20-35 characters
 */
export const ERROR_MESSAGES = {
  WALLET_DISCONNECT: "Failed to disconnect",
  NETWORK_SWITCH: "Failed to switch network",
  NETWORK_UNSUPPORTED: "Network not supported",
  MINI_APP_ADD: "Failed to save app",
  TRANSACTION_FAILED: "Transaction failed",
  CLAIM_FAILED: "Failed to claim rewards",
  GM_SUBMIT_FAILED: "Failed to submit GM",
  UNKNOWN: "Something went wrong",
} as const;

/**
 * Success messages for common operations
 * Optimized for mobile: 15-30 characters
 */
export const SUCCESS_MESSAGES = {
  WALLET_CONNECTED: "Wallet connected",
  WALLET_DISCONNECTED: "Wallet disconnected",
  NETWORK_SWITCHED: "Network switched",
  MINI_APP_ADDED: "App saved",
  MINI_APP_ADDED_NO_NOTIF: "App saved",
  TRANSACTION_SUCCESS: "Transaction confirmed",
  CLAIM_SUCCESS: "Rewards claimed",
  GM_SUBMITTED: "GM submitted",
} as const;

/**
 * Loading messages for async operations
 * Optimized for mobile: 15-25 characters
 */
export const LOADING_MESSAGES = {
  WALLET_DISCONNECTING: "Disconnecting...",
  NETWORK_SWITCHING: "Switching...",
  MINI_APP_ADDING: "Saving...",
  TRANSACTION_PENDING: "Processing...",
  CLAIM_PENDING: "Claiming...",
  GM_SUBMITTING: "Submitting...",
} as const;

type ErrorContext = {
  operation: string;
  [key: string]: unknown;
};

/**
 * Handle errors with user-friendly toast notifications
 * Logs error details to console for debugging
 */
export function handleError(
  error: unknown,
  userMessage: string,
  context?: ErrorContext
): void {
  // Log full error details for debugging
  console.error(`[${context?.operation || "Error"}]:`, error, context);

  // Show user-friendly message
  toast.error(userMessage);
}

/**
 * Handle success with toast notification
 */
export function handleSuccess(message: string): void {
  toast.success(message);
}

/**
 * Show loading toast and return dismiss function
 */
export function showLoading(message: string): () => void {
  const toastId = toast.loading(message);
  return () => toast.dismiss(toastId);
}

/**
 * Execute an async operation with error handling and user feedback
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  options: {
    loadingMessage?: string;
    successMessage?: string;
    errorMessage: string;
    context?: ErrorContext;
  }
): Promise<T | undefined> {
  let dismissLoading: (() => void) | undefined;

  try {
    if (options.loadingMessage) {
      dismissLoading = showLoading(options.loadingMessage);
    }

    const result = await operation();

    if (dismissLoading) {
      dismissLoading();
    }

    if (options.successMessage) {
      handleSuccess(options.successMessage);
    }

    return result;
  } catch (error) {
    if (dismissLoading) {
      dismissLoading();
    }

    handleError(error, options.errorMessage, options.context);
    return;
  }
}

/**
 * Extract user-friendly error message from various error types
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  if (typeof error === "object" && error !== null && "message" in error) {
    return String(error.message);
  }
  return ERROR_MESSAGES.UNKNOWN;
}
