/**
 * Input validation utilities for OnePulse
 * Provides secure and reusable validation functions for common data types
 */

/**
 * Validates if a string is a valid Ethereum address (0x-prefixed 40 hex characters)
 */
export function isValidAddress(value: unknown): value is `0x${string}` {
  if (typeof value !== "string") {
    return false;
  }
  return /^0x[0-9a-fA-F]{40}$/.test(value);
}

/**
 * Validates if a value is a non-negative integer
 */
export function isNonNegativeInteger(value: unknown): value is number {
  return Number.isInteger(value) && value >= 0;
}

/**
 * Validates if a string is a valid numeric string (can be parsed to a number)
 */
export function isValidNumericString(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }
  const parsed = Number.parseFloat(value);
  return !Number.isNaN(parsed) && value.trim() !== "";
}

/**
 * Safely parses a numeric string to a number
 * Returns null if parsing fails
 */
export function safeParseNumber(value: string): number | null {
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? null : parsed;
}

/**
 * Validates if a timestamp (in seconds) is reasonable (not in the distant future)
 * Allows up to 1 year in the future as a reasonable buffer
 */
export function isValidTimestamp(
  timestampSeconds: number,
  maxFutureSeconds: number = 365 * 24 * 60 * 60
): boolean {
  const now = Math.floor(Date.now() / 1000);
  const oneSecondAgo = now - 1;
  const maxAllowed = now + maxFutureSeconds;

  return (
    isNonNegativeInteger(timestampSeconds) &&
    timestampSeconds >= oneSecondAgo &&
    timestampSeconds <= maxAllowed
  );
}

/**
 * Validates if a value is a supported chain ID
 */
export function isValidChainId(value: unknown): value is number {
  return Number.isInteger(value) && value > 0;
}

/**
 * Type guard for checking if an error is an Error instance
 */
export function isErrorInstance(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Safely extracts message from an error object
 * Returns the error message if available, otherwise returns a default message
 */
export function getErrorMessage(error: unknown, defaultMessage = "Unknown error"): string {
  if (isErrorInstance(error)) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as Record<string, unknown>).message;
    if (typeof message === "string") {
      return message;
    }
  }
  return defaultMessage;
}
