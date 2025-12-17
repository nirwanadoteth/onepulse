import {
  BASE_CHAIN_ID,
  CELO_CHAIN_ID,
  OPTIMISM_CHAIN_ID,
} from "@/lib/constants";

export const DAILY_REWARDS_V2_ADDRESSES: Record<number, `0x${string}` | ""> = {
  [BASE_CHAIN_ID]:
    (process.env.NEXT_PUBLIC_DAILY_REWARDS_V2_ADDRESS_BASE as `0x${string}`) ||
    "",
  [CELO_CHAIN_ID]:
    (process.env.NEXT_PUBLIC_DAILY_REWARDS_V2_ADDRESS_CELO as `0x${string}`) ||
    "",
  [OPTIMISM_CHAIN_ID]:
    (process.env
      .NEXT_PUBLIC_DAILY_REWARDS_V2_ADDRESS_OPTIMISM as `0x${string}`) || "",
};

export const REWARD_TOKENS: Record<number, `0x${string}` | ""> = {
  [BASE_CHAIN_ID]: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC on Base
  [CELO_CHAIN_ID]: "0x765de816845861e75a25fca122bb6898b8b1282a", // cUSD on Celo
  [OPTIMISM_CHAIN_ID]: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", // USDC on Optimism
};

export const REWARD_TOKEN_DECIMALS: Record<number, number> = {
  [BASE_CHAIN_ID]: 6, // USDC on Base
  [CELO_CHAIN_ID]: 18, // cUSD on Celo
  [OPTIMISM_CHAIN_ID]: 6, // USDC on Optimism
};

export const REWARD_TOKEN_SYMBOLS: Record<number, string> = {
  [BASE_CHAIN_ID]: "USDC",
  [CELO_CHAIN_ID]: "cUSD",
  [OPTIMISM_CHAIN_ID]: "USDC",
};

export const DEFAULT_CLAIM_REWARD_AMOUNT = "0.01"; // 0.01 USDC/cUSD
