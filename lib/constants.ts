// Per-chain Daily GM contract addresses
export const DAILY_GM_ADDRESSES: Record<number, `0x${string}`> = {
  // Base mainnet (8453)
  8453:
    (process.env.NEXT_PUBLIC_DAILY_GM_ADDRESS_BASE as `0x${string}`) ||
    ("" as `0x${string}`),
  // Celo mainnet (42220)
  42220:
    (process.env.NEXT_PUBLIC_DAILY_GM_ADDRESS_CELO as `0x${string}`) ||
    ("" as `0x${string}`),
  // Optimism mainnet (10)
  10:
    (process.env.NEXT_PUBLIC_DAILY_GM_ADDRESS_OPTIMISM as `0x${string}`) ||
    ("" as `0x${string}`),
}

// Back-compat: default to Base address env if present
export const DAILY_GM_ADDRESS =
  process.env.NEXT_PUBLIC_DAILY_GM_ADDRESS || DAILY_GM_ADDRESSES[8453] || ""

export function getDailyGmAddress(chainId?: number): `0x${string}` | "" {
  if (!chainId) return DAILY_GM_ADDRESS as `0x${string}` | ""
  return DAILY_GM_ADDRESSES[chainId] || ("" as const)
}

// Per-chain Daily Rewards contract addresses (DEGEN token claims)
export const DAILY_REWARDS_ADDRESSES: Record<number, `0x${string}`> = {
  // Base mainnet (8453) - DEGEN rewards
  8453: "0x23c656fa9c5e404B1927892FeFE23696DB54fB50" as const,
}

export function getDailyRewardsAddress(chainId?: number): `0x${string}` | "" {
  if (!chainId) return DAILY_REWARDS_ADDRESSES[8453] || ("" as const)
  return DAILY_REWARDS_ADDRESSES[chainId] || ("" as const)
}
