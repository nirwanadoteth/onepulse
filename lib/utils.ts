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

const digitRegex = /^\d+$/;
const EIP155_REGEX = /^eip155:(\d+)$/;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
    return Number.isInteger(input) && input > 0 ? input : undefined;
  }
  if (typeof input === "string") {
    // Reject empty, whitespace-only, or non-digit strings
    const trimmed = input.trim();
    if (!digitRegex.test(trimmed)) {
      return;
    }
    const parsed = Number.parseInt(trimmed, 10);
    return parsed > 0 ? parsed : undefined;
  }
  return;
}

export function parseEip155NetworkId(value: unknown): number | undefined {
  if (typeof value === "number") {
    if (Number.isInteger(value) && value > 0) {
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
