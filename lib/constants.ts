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
  8453: "0x09C645618e84387186efBf9687fA602E4D21120B" as const,
};

// Time constants
export const SECONDS_PER_DAY = 86_400;
export const MILLISECONDS_PER_DAY = SECONDS_PER_DAY * 1000;
