import { type NextRequest, NextResponse } from "next/server";
import {
  createPublicClient,
  decodeEventLog,
  http,
  isAddress,
  isHash,
  keccak256,
  type PublicClient,
  parseAbi,
  type Transport,
  toBytes,
} from "viem";
import { base } from "viem/chains";
import { DAILY_CLAIM_LIMIT } from "@/lib/constants";
import { handleError } from "@/lib/error-handling";
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

const CLAIMED_EVENT_ABI = parseAbi([
  "event Claimed(address indexed recipient, uint256 indexed fid, uint256 amount)",
]);

// Compute event topic at runtime to ensure correctness
const CLAIMED_EVENT_TOPIC = keccak256(
  toBytes("Claimed(address,uint256,uint256)")
);

/**
 * Verifies the transaction emitted a Claimed event from the DailyRewards contract.
 * This approach works for both direct transactions and sponsored/smart wallet transactions
 * where the outer transaction may go through a paymaster or entrypoint contract.
 */
async function verifyTransaction(
  transactionHash: string,
  contractAddress: string,
  claimer: string,
  publicClient: PublicClient<Transport, typeof base>
) {
  const txHash = transactionHash as `0x${string}`;

  const receipt = await publicClient.getTransactionReceipt({ hash: txHash });

  if (!receipt) {
    throw new ValidationError("Transaction not found on-chain");
  }

  if (receipt.status !== "success") {
    throw new ValidationError(`Transaction failed on-chain: ${receipt.status}`);
  }

  // Find the Claimed event from the DailyRewards contract in the logs
  // This works for both direct calls and calls through paymasters/smart wallets
  const claimedLog = receipt.logs.find(
    (log) =>
      log.address.toLowerCase() === contractAddress.toLowerCase() &&
      log.topics[0] === CLAIMED_EVENT_TOPIC
  );

  if (!claimedLog) {
    throw new ValidationError(
      "No Claimed event found from DailyRewards contract"
    );
  }

  // Decode the event to verify the recipient matches the claimer
  const decodedEvent = decodeEventLog({
    abi: CLAIMED_EVENT_ABI,
    data: claimedLog.data,
    topics: claimedLog.topics,
  });

  const recipient = decodedEvent.args.recipient as string;
  if (recipient.toLowerCase() !== claimer.toLowerCase()) {
    throw new ValidationError("Claimed event recipient does not match claimer");
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

    handleError(
      error,
      "Internal server error in claims/confirm",
      {
        operation: "claims/confirm",
      },
      { silent: true }
    );
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
