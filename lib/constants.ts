export type SupportedChain = {
  id: number;
  name: string;
};

export const BASE_CHAIN_ID = 8453;
export const CELO_CHAIN_ID = 42_220;
export const OPTIMISM_CHAIN_ID = 10;

export const SUPPORTED_CHAINS: readonly SupportedChain[] = [
  { id: BASE_CHAIN_ID, name: "Base" },
  { id: CELO_CHAIN_ID, name: "Celo" },
  { id: OPTIMISM_CHAIN_ID, name: "Optimism" },
] as const;

export const DAILY_GM_ADDRESSES: Record<
  SupportedChain["id"],
  `0x${string}` | ""
> = {
  [BASE_CHAIN_ID]:
    (process.env.NEXT_PUBLIC_DAILY_GM_ADDRESS_BASE as `0x${string}`) || "",
  [CELO_CHAIN_ID]:
    (process.env.NEXT_PUBLIC_DAILY_GM_ADDRESS_CELO as `0x${string}`) || "",
  [OPTIMISM_CHAIN_ID]:
    (process.env.NEXT_PUBLIC_DAILY_GM_ADDRESS_OPTIMISM as `0x${string}`) || "",
};

export const DAILY_GM_ADDRESS =
  process.env.NEXT_PUBLIC_DAILY_GM_ADDRESS ||
  DAILY_GM_ADDRESSES[BASE_CHAIN_ID] ||
  "";

export const DAILY_REWARDS_ADDRESSES: Record<
  SupportedChain["id"],
  `0x${string}` | ""
> = {
  [BASE_CHAIN_ID]:
    (process.env.NEXT_PUBLIC_DAILY_REWARDS_ADDRESS_BASE as `0x${string}`) || "",
  [CELO_CHAIN_ID]:
    (process.env.NEXT_PUBLIC_DAILY_REWARDS_ADDRESS_CELO as `0x${string}`) || "",
  [OPTIMISM_CHAIN_ID]:
    (process.env.NEXT_PUBLIC_DAILY_REWARDS_ADDRESS_OPTIMISM as `0x${string}`) ||
    "",
};

export const DAILY_REWARDS_ADDRESS =
  process.env.NEXT_PUBLIC_DAILY_REWARDS_ADDRESS ||
  DAILY_REWARDS_ADDRESSES[BASE_CHAIN_ID] ||
  "";

export const SECONDS_PER_DAY = 86_400;
export const MILLISECONDS_PER_DAY = SECONDS_PER_DAY * 1000;

export const DAILY_CLAIM_LIMIT = 250;
