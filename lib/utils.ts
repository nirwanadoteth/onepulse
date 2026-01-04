import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { MILLISECONDS_PER_DAY, SECONDS_PER_DAY } from "./constants";

const DOMAIN_LABEL_PATTERN = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;

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
 * Check if a string is a valid ENS or Base domain
 * Validates domain structure: labels separated by dots, each label following DNS rules
 */
export function isDomainFormat(input: string): boolean {
  const trimmed = input.trim();
  if (!trimmed) {
    return false;
  }

  // Reject leading/trailing dots or consecutive dots
  if (
    trimmed.startsWith(".") ||
    trimmed.endsWith(".") ||
    trimmed.includes("..")
  ) {
    return false;
  }

  // Check for valid suffix
  // Accepts both ENS (.eth) and Base domain (.base.eth) formats
  if (!trimmed.endsWith(".eth")) {
    return false;
  }

  // Split into labels and validate each
  const labels = trimmed.split(".");
  if (labels.length < 2) {
    return false;
  }

  // Each label must:
  // - Be 1-63 characters
  // - Contain only ASCII letters, numbers, and hyphens
  // - Not start or end with a hyphen
  return labels.every(
    (label) => label.length > 0 && DOMAIN_LABEL_PATTERN.test(label)
  );
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

export function normalizeAddress(address?: string | null): string | null {
  return address?.toLowerCase() ?? null;
}

export function isBaseChain(): boolean {
  return true;
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

export function canSaveMiniApp(params: {
  isMiniAppReady: boolean;
  inMiniApp: boolean;
  clientAdded: boolean | undefined;
}): boolean {
  const { isMiniAppReady, inMiniApp, clientAdded } = params;
  return isMiniAppReady && inMiniApp && clientAdded !== true;
}

/**
 * Get the icon name for a given chain ID
 */
export function getChainIconName(): string {
  return "base";
}
