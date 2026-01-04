import { base } from "@wagmi/core/chains";

export const SUPPORTED_CHAINS = [base];
export type SupportedChain = (typeof SUPPORTED_CHAINS)[number];
export type ChainId = typeof BASE_CHAIN_ID;
export const BASE_CHAIN_ID = base.id;

export const DAILY_GM_ADDRESS = "0xC9F754F99C069779486Eb9d70b46209c9Ed396CA";

export const DAILY_REWARDS_V2_ADDRESS =
  "0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07";
export const REWARD_TOKEN = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // USDC on Base
export const REWARD_TOKEN_DECIMALS = 6;
export const REWARD_TOKEN_SYMBOL = "USDC";

export const DEFAULT_CLAIM_REWARD_AMOUNT = "0.01"; // 0.01 USDC
export const SECONDS_PER_DAY = 86_400;
export const MILLISECONDS_PER_DAY = SECONDS_PER_DAY * 1000;
export const DAILY_CLAIM_LIMIT = 250;
