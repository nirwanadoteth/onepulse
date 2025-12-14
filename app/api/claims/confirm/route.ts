import { type NextRequest, NextResponse } from "next/server";
import {
  createPublicClient,
  decodeFunctionData,
  http,
  isAddress,
  isHash,
  type PublicClient,
  parseAbi,
  type Transport,
} from "viem";
import { base } from "viem/chains";
import { DAILY_CLAIM_LIMIT } from "@/lib/constants";
import {
  checkRateLimit,
  getDailyClaimsCount,
  processClaimTransaction,
} from "@/lib/kv";
import { getDailyRewardsAddress } from "@/lib/utils";

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

const CLAIM_ABI = parseAbi([
  "function claim(address recipient, uint256 amount, uint256 nonce, uint256 expiry, bytes signature)",
]);

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
    throw new ValidationError("Transaction not found on-chain");
  }

  if (receipt.status !== "success") {
    throw new ValidationError(`Transaction failed on-chain: ${receipt.status}`);
  }

  if (
    !receipt.to ||
    receipt.to.toLowerCase() !== contractAddress.toLowerCase()
  ) {
    throw new ValidationError(
      "Transaction is not to the DailyRewards contract"
    );
  }

  if (!transaction) {
    throw new ValidationError("Transaction input not found");
  }

  if (!transaction.input) {
    throw new ValidationError("Transaction input not found");
  }

  // The function selector for claim(address,uint256,uint256,uint256,bytes)
  const CLAIM_FUNCTION_SELECTOR = "0x6e8aa08a";
  if (!transaction.input.startsWith(CLAIM_FUNCTION_SELECTOR)) {
    throw new ValidationError("Transaction did not call the claim function");
  }

  // Verify the recipient in the transaction input matches the claimer
  // This supports smart wallets where transaction.from might be the bundler
  const { args } = decodeFunctionData({
    abi: CLAIM_ABI,
    data: transaction.input,
  });

  if (!args || typeof args[0] !== "string") {
    throw new ValidationError("Invalid transaction arguments");
  }

  const recipient = args[0];
  if (recipient.toLowerCase() !== claimer.toLowerCase()) {
    throw new ValidationError("Transaction recipient does not match claimer");
  }
}

function validateRequestBody(body: unknown): {
  transactionHash: string;
  claimer: string;
} | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const { transactionHash, claimer } = body as Record<string, unknown>;

  if (
    !transactionHash ||
    typeof transactionHash !== "string" ||
    !isHash(transactionHash)
  ) {
    return null;
  }

  if (!claimer || typeof claimer !== "string" || !isAddress(claimer)) {
    return null;
  }

  return { transactionHash, claimer };
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
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip = forwardedFor
      ? forwardedFor.split(",")[0]?.trim() || "unknown"
      : "unknown";
    const { allowed: ipAllowed } = await checkRateLimit(`ip:${ip}`, 10, 60);
    if (!ipAllowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = (await req.json()) as unknown;
    const validated = validateRequestBody(body);

    if (!validated) {
      return NextResponse.json(
        { error: "Invalid request body or parameters" },
        { status: 400 }
      );
    }

    const { transactionHash, claimer } = validated;

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

    // Process the transaction atomically
    const { status, count } = await processClaimTransaction(
      transactionHash,
      DAILY_CLAIM_LIMIT
    );

    if (status === "already_processed") {
      const currentCount = await getDailyClaimsCount();
      return NextResponse.json({
        success: true,
        message: "Claim already processed",
        count: currentCount,
        allowed: true,
      });
    }

    if (status === "limit_exceeded") {
      return NextResponse.json({
        success: true,
        message: "Claim confirmed but daily limit reached",
        count,
        allowed: false,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Claim confirmed and counter incremented",
      count,
      allowed: true,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        {
          error: "Failed to confirm claim",
          message: error.message,
        },
        { status: 400 }
      );
    }

    console.error("Internal server error in claims/confirm:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
