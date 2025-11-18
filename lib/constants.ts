export type SupportedChain = {
  id: number;
  name: string;
};

export const SUPPORTED_CHAINS: readonly SupportedChain[] = [
  { id: 8453, name: "Base" },
  { id: 42_220, name: "Celo" },
  { id: 10, name: "Optimism" },
] as const;

export const CELO_CHAIN_ID = 42_220;

export const DAILY_GM_ADDRESSES: Record<number, `0x${string}`> = {
  8453:
    (process.env.NEXT_PUBLIC_DAILY_GM_ADDRESS_BASE as `0x${string}`) ||
    ("" as `0x${string}`),
  42220:
    (process.env.NEXT_PUBLIC_DAILY_GM_ADDRESS_CELO as `0x${string}`) ||
    ("" as `0x${string}`),
  10:
    (process.env.NEXT_PUBLIC_DAILY_GM_ADDRESS_OPTIMISM as `0x${string}`) ||
    ("" as `0x${string}`),
};

export const DAILY_GM_ADDRESS =
  process.env.NEXT_PUBLIC_DAILY_GM_ADDRESS || DAILY_GM_ADDRESSES[8453] || "";

export const DAILY_REWARDS_ADDRESSES: Record<number, `0x${string}`> = {
  8453:
    (process.env.NEXT_PUBLIC_DAILY_REWARDS_ADDRESS_BASE as `0x${string}`) ||
    ("" as `0x${string}`),
};

export const SECONDS_PER_DAY = 86_400;
export const MILLISECONDS_PER_DAY = SECONDS_PER_DAY * 1000;
