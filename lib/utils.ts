import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { MILLISECONDS_PER_DAY, SECONDS_PER_DAY } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getChainExplorer(): string {
  return "https://basescan.org";
}

/**
 * Get current day number (days since Unix epoch)
 * Used for GM tracking and congratulations logic
 */
export function getCurrentDay(): number {
  return Math.floor(Date.now() / MILLISECONDS_PER_DAY);
}

/**
 * Get current timestamp in seconds
 */
export function getCurrentTimestampSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Convert timestamp in seconds to day number
 */
export function timestampToDayNumber(timestampSeconds: number): number {
  return Math.floor(timestampSeconds / SECONDS_PER_DAY);
}

/**
 * Performs shallow comparison of two objects by checking if any key's value differs or if the set of keys differs.
 * Returns true if prev is null/undefined or if any property value has changed or if keys were added/removed.
 */
export function hasChanged<T extends Record<string, unknown>>(
  prev: T | null | undefined,
  current: T
): boolean {
  if (!prev) {
    return true;
  }
  const currentKeys = Object.keys(current);
  const prevKeys = Object.keys(prev);
  if (currentKeys.length !== prevKeys.length) {
    return true;
  }
  return currentKeys.some((key) => prev[key] !== current[key]);
}

/**
 * Get chain-specific button classes for styling
 */
export function getChainBtnClasses(): string {
  return "bg-[#0052ff] text-white hover:bg-[#0052ff]/90";
}

/**
 * Determine if transactions should be sponsored on a given chain.
 * Currently, sponsorship is only supported on Base.
 */
export function isSponsoredOnChain(sponsored: boolean): boolean {
  return Boolean(sponsored);
}

/**
 * Get the icon name for a given chain ID
 */
export function getChainIconName(): string {
  return "base";
}

/**
 * Format a number with a specific number of decimal places
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Truncate an Ethereum address to display format (0x1234...5678)
 */
export function truncateAddress(address: string, chars: number = 4): string {
  if (!address) return "";
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Wait for a specified duration (in milliseconds)
 * Useful for rate limiting and testing
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Create a memoized version of a computation result
 * Only recomputes if dependencies change
 */
export function memoize<T>(
  computeFn: () => T,
  dependencies: readonly unknown[]
): {
  current: T;
  dependencies: readonly unknown[];
} {
  return {
    current: computeFn(),
    dependencies,
  };
}

/**
 * Check if two arrays are equal (shallow comparison)
 */
export function arraysEqual<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((item, index) => item === b[index]);
}
