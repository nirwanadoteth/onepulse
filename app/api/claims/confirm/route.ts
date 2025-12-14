import { type NextRequest, NextResponse } from "next/server";
import {
  createPublicClient,
  decodeFunctionData,
  http,
  type PublicClient,
  parseAbi,
  type Transport,
} from "viem";
import { base } from "viem/chains";
import { DAILY_CLAIM_LIMIT } from "@/lib/constants";
import { checkAndIncrementDailyClaims, checkRateLimit } from "@/lib/kv";
import { getDailyRewardsAddress } from "@/lib/utils";

/**
 * Verifies the transaction was to the correct contract and called the claim function.
 * Fetches receipt and transaction in parallel to minimize active CPU wait time.
 */
async function verifyTransaction(
  transactionHash: string,
  contractAddress: string,
  claimer: string,
  publicClient: PublicClient<Transport, typeof base>
) {
  const txHash = transactionHash as `0x${string}`;

  // Fetch both in parallel to reduce I/O wait time
  const [receipt, transaction] = await Promise.all([
    publicClient.getTransactionReceipt({ hash: txHash }),
    publicClient.getTransaction({ hash: txHash }),
  ]);

  if (!receipt) {
    throw new Error("Transaction not found on-chain");
  }

  if (receipt.status !== "success") {
    throw new Error(`Transaction failed on-chain: ${receipt.status}`);
  }

  if (
    !receipt.to ||
    receipt.to.toLowerCase() !== contractAddress.toLowerCase()
  ) {
    throw new Error("Transaction is not to the DailyRewards contract");
  }

  if (!transaction) {
    throw new Error("Transaction input not found");
  }

  if (!transaction.input) {
    throw new Error("Transaction input not found");
  }

  // The function selector for claim(address,uint256,uint256,uint256,bytes)
  const CLAIM_FUNCTION_SELECTOR = "0x6e8aa08a";
  if (!transaction.input.startsWith(CLAIM_FUNCTION_SELECTOR)) {
    throw new Error("Transaction did not call the claim function");
  }

  // Verify the recipient in the transaction input matches the claimer
  // This supports smart wallets where transaction.from might be the bundler
  const abi = parseAbi([
    "function claim(address recipient, uint256 amount, uint256 nonce, uint256 expiry, bytes signature)",
  ]);

  const { args } = decodeFunctionData({
    abi,
    data: transaction.input,
  });

  const recipient = args[0];
  if (recipient.toLowerCase() !== claimer.toLowerCase()) {
    throw new Error("Transaction recipient does not match claimer");
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
    // Rate limit by IP
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    const { allowed: ipAllowed } = await checkRateLimit(`ip:${ip}`, 10, 60);
    if (!ipAllowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

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

    // Rate limit by claimer
    const { allowed: claimerAllowed } = await checkRateLimit(
      `claimer:${claimer}`,
      5,
      60
    );
    if (!claimerAllowed) {
      return NextResponse.json(
        { error: "Too many requests for this claimer" },
        { status: 429 }
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
    await verifyTransaction(
      transactionHash,
      contractAddress,
      claimer,
      publicClient
    );

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
