import { isWalletACoinbaseSmartWallet } from "@coinbase/onchainkit/wallet"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {
  createPublicClient,
  http,
  type PublicClient,
  type RpcUserOperation,
} from "viem"
import { base } from "viem/chains"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
const publicClient = createPublicClient({
  chain: base,
  transport: http(),
})
// Checks whether the given EOA/account address is a Coinbase Smart Wallet by
// simulating a minimal ERC-4337 v0.6 UserOperation against the provided viem client.
// Returns false on any failure to keep calling code simple and resilient.
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
  }
  try {
    const res = await isWalletACoinbaseSmartWallet({
      client: publicClient as PublicClient,
      userOp: userOperation,
    })
    return res.isCoinbaseSmartWallet === true
  } catch {
    return false
  }
}
