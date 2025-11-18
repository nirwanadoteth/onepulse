export type Chain = { id: number; name: string };

const DEFAULT_CHAINS: readonly Chain[] = [
  { id: 8453, name: "Base" },
  { id: 42_220, name: "Celo" },
  { id: 10, name: "Optimism" },
];

/**
 * Filter chains by allowlist
 * Returns full list if allowlist is empty/undefined
 */
export const getChainList = (allowedChainIds?: number[]): Chain[] => {
  if (!Array.isArray(allowedChainIds) || allowedChainIds.length === 0) {
    return [...DEFAULT_CHAINS];
  }
  return DEFAULT_CHAINS.filter((c) => allowedChainIds.includes(c.id));
};

/**
 * Check if all chains have completed GM for today
 */
export const areAllChainsComplete = (
  chainIds: number[],
  statusMap: Record<number, { hasGmToday: boolean; targetSec: number }>
): boolean => {
  if (chainIds.some((id) => statusMap[id] == null)) {
    return false;
  }
  return chainIds.every((id) => statusMap[id]?.hasGmToday);
};

/**
 * Calculate earliest next GM time across all chains
 */
export const getNextTargetSec = (
  chainIds: number[],
  statusMap: Record<number, { hasGmToday: boolean; targetSec: number }>
): number => {
  const targets = chainIds
    .map((id) => statusMap[id]?.targetSec || 0)
    .filter((t) => t > 0);
  return targets.length ? Math.min(...targets) : 0;
};
