import { type NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { DAILY_CLAIM_LIMIT } from "@/lib/constants";
import { checkAndIncrementDailyClaims } from "@/lib/kv";
import { getDailyRewardsAddress } from "@/lib/utils";

/**
 * Verifies the transaction was to the correct contract and called the claim function.
 * Fetches receipt and transaction in parallel to minimize active CPU wait time.
 */
async function verifyTransaction(
  transactionHash: string,
  contractAddress: string,
  publicClient: unknown
) {
  if (!publicClient || typeof publicClient !== "object") {
    throw new Error("Invalid public client");
  }
  const client = publicClient as {
    getTransactionReceipt: (opts: { hash: `0x${string}` }) => Promise<unknown>;
    getTransaction: (opts: { hash: `0x${string}` }) => Promise<unknown>;
  };

  const txHash = transactionHash as `0x${string}`;

  // Fetch both in parallel to reduce I/O wait time
  const [receipt, transaction] = await Promise.all([
    client.getTransactionReceipt({ hash: txHash }),
    client.getTransaction({ hash: txHash }),
  ]);

  if (!receipt || typeof receipt !== "object") {
    throw new Error("Transaction not found on-chain");
  }

  const typedReceipt = receipt as { status?: string; to?: string };

  if (typedReceipt.status !== "success") {
    throw new Error(`Transaction failed on-chain: ${typedReceipt.status}`);
  }

  if (
    !typedReceipt.to ||
    typedReceipt.to.toLowerCase() !== contractAddress.toLowerCase()
  ) {
    throw new Error("Transaction is not to the DailyRewards contract");
  }

  if (!transaction || typeof transaction !== "object") {
    throw new Error("Transaction input not found");
  }

  const typedTx = transaction as { input?: string };

  if (!typedTx.input) {
    throw new Error("Transaction input not found");
  }

  // The function selector for claim(address,uint256,uint256,uint256,bytes)
  const CLAIM_FUNCTION_SELECTOR = "0x6e8aa08a";
  if (!typedTx.input.startsWith(CLAIM_FUNCTION_SELECTOR)) {
    throw new Error("Transaction did not call the claim function");
  }
}

/**
 * Confirms a claim was successfully executed on-chain and increments the daily limit counter.
 * This endpoint should only be called after the on-chain transaction has been confirmed.
 *
 * Flow:
 * 1. User gets authorization signature from /api/claims/execute
 * 2. User submits transaction to contract
 * 3. Transaction is confirmed on-chain
 * 4. Frontend calls this endpoint to increment counter
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as unknown;

    // Validate request body
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { transactionHash, claimer } = body as Record<string, unknown>;

    if (!transactionHash || typeof transactionHash !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid transactionHash" },
        { status: 400 }
      );
    }

    if (!claimer || typeof claimer !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid claimer" },
        { status: 400 }
      );
    }

    const publicClient = createPublicClient({
      chain: base,
      transport: http(),
    });

    const contractAddress = getDailyRewardsAddress(base.id);
    if (!contractAddress) {
      return NextResponse.json(
        { error: "Contract address not configured" },
        { status: 500 }
      );
    }

    // Verify the transaction
    await verifyTransaction(transactionHash, contractAddress, publicClient);

    // Increment the daily claims counter
    const { allowed, count } =
      await checkAndIncrementDailyClaims(DAILY_CLAIM_LIMIT);

    return NextResponse.json({
      success: true,
      message: "Claim confirmed and counter incremented",
      count,
      allowed,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      {
        error: "Failed to confirm claim",
        message,
      },
      { status: 400 }
    );
  }
}
