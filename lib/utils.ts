import { isWalletACoinbaseSmartWallet } from "@coinbase/onchainkit/wallet";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  createPublicClient,
  http,
  type PublicClient,
  type RpcUserOperation,
} from "viem";
import { base, celo, optimism } from "viem/chains";
import {
  BASE_CHAIN_ID,
  CELO_CHAIN_ID,
  DAILY_GM_ADDRESS,
  DAILY_GM_ADDRESSES,
  DAILY_REWARDS_ADDRESSES,
  MILLISECONDS_PER_DAY,
  OPTIMISM_CHAIN_ID,
  SECONDS_PER_DAY,
} from "./constants";

const digitRegex = /^\d+$/;
const EIP155_REGEX = /^eip155:(\d+)$/;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get the Daily GM contract address for a given chain ID
 */
export function getDailyGmAddress(chainId?: number): `0x${string}` | "" {
  if (!chainId) {
    return DAILY_GM_ADDRESS as `0x${string}` | "";
  }
  return DAILY_GM_ADDRESSES[chainId] || ("" as const);
}

/**
 * Get the Daily Rewards contract address for a given chain ID
 */
export function getDailyRewardsAddress(chainId?: number): `0x${string}` | "" {
  if (!chainId) {
    return DAILY_REWARDS_ADDRESSES[BASE_CHAIN_ID] || ("" as const);
  }
  return DAILY_REWARDS_ADDRESSES[chainId] || ("" as const);
}

const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

export async function detectCoinbaseSmartWallet(
  address: `0x${string}`
): Promise<boolean> {
  const userOperation: RpcUserOperation<"0.6"> = {
    sender: address,
    nonce: "0x0",
    initCode: "0x",
    callData: "0x",
    callGasLimit: "0x0",
    verificationGasLimit: "0x0",
    preVerificationGas: "0x0",
    maxFeePerGas: "0x0",
    maxPriorityFeePerGas: "0x0",
    paymasterAndData: "0x",
    signature: "0x",
  };
  try {
    const res = await isWalletACoinbaseSmartWallet({
      client: publicClient as PublicClient,
      userOp: userOperation,
    });
    return res.isCoinbaseSmartWallet === true;
  } catch {
    return false;
  }
}

const chainExplorerMap: Record<number, string> = {
  [base.id]: "https://basescan.org",
  [celo.id]: "https://celoscan.io",
  [optimism.id]: "https://optimistic.etherscan.io",
};

export function getChainExplorer(chainId?: number) {
  if (!chainId) {
    return "https://basescan.org";
  }

  return chainExplorerMap[chainId] ?? "https://basescan.org";
}

export function normalizeChainId(input: unknown): number | undefined {
  if (typeof input === "number") {
    return Number.isSafeInteger(input) && input > 0 ? input : undefined;
  }
  if (typeof input === "string") {
    // Reject empty, whitespace-only, or non-digit strings
    const trimmed = input.trim();
    if (!digitRegex.test(trimmed)) {
      return;
    }
    const parsed = Number.parseInt(trimmed, 10);
    return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : undefined;
  }
  return;
}

export function parseEip155NetworkId(value: unknown): number | undefined {
  if (typeof value === "number") {
    if (Number.isSafeInteger(value) && value > 0) {
      return value;
    }
    return; // invalid numeric id
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    const match = EIP155_REGEX.exec(trimmed);
    if (!match) {
      return; // not an eip155 pattern
    }
    const parsed = Number(match[1]);
    if (Number.isSafeInteger(parsed) && parsed > 0) {
      return parsed;
    }
    return; // invalid parsed number
  }
  return; // unsupported type
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
 */
export function isDomainFormat(input: string): boolean {
  if (!input) {
    return false;
  }
  if (!input.includes(".")) {
    return false;
  }
  return input.endsWith(".eth") || input.endsWith(".base.eth");
}

/**
 * Normalize an Ethereum address to lowercase
 */
export function normalizeAddress(address?: string | null): string | null {
  return address?.toLowerCase() ?? null;
}

/**
 * Check if a chain ID is the Celo network
 */
export function isCeloChain(chainId?: number): boolean {
  return chainId === CELO_CHAIN_ID;
}

export function isBaseChain(chainId?: number): boolean {
  return chainId === BASE_CHAIN_ID;
}

export function isOptimismChain(chainId?: number): boolean {
  return chainId === OPTIMISM_CHAIN_ID;
}

/**
 * Determine if transactions should be sponsored on a given chain.
 * Currently, sponsorship is only supported on Base.
 */
export function isSponsoredOnChain(
  sponsored: boolean,
  chainId?: number | null
): boolean {
  return (
    Boolean(sponsored) &&
    isBaseChain(typeof chainId === "number" ? chainId : undefined)
  );
}

export function canSaveMiniApp(params: {
  isMiniAppReady: boolean;
  inMiniApp: boolean;
  clientAdded: boolean | undefined;
}): boolean {
  const { isMiniAppReady, inMiniApp, clientAdded } = params;
  return isMiniAppReady && inMiniApp && clientAdded !== true;
}
