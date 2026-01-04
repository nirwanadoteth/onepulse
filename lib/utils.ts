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
