import { type NextRequest, NextResponse } from "next/server";
import {
  createPublicClient,
  createWalletClient,
  encodePacked,
  http,
  keccak256,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";

import { dailyRewardsAbi } from "@/lib/abi/daily-rewards";
import { getDailyRewardsAddress } from "@/lib/constants";

const BACKEND_SIGNER_PRIVATE_KEY = process.env.BACKEND_SIGNER_PRIVATE_KEY;

if (!BACKEND_SIGNER_PRIVATE_KEY) {
  console.warn("BACKEND_SIGNER_PRIVATE_KEY not configured");
}

type ValidationSuccess = {
  valid: true;
  data: {
    claimer: string;
    fid: number | bigint;
    deadline: number | bigint;
  };
};

type ValidationFailure = {
  valid: false;
  missing: string[];
};

function validateRequest(
  body: Record<string, unknown>
): ValidationSuccess | ValidationFailure {
  const { claimer, fid, deadline } = body;
  const missing: string[] = [];

  if (!claimer) {
    missing.push("claimer");
  }
  if (!fid) {
    missing.push("fid");
  }
  if (!deadline) {
    missing.push("deadline");
  }

  if (missing.length > 0) {
    return { valid: false, missing };
  }

  return {
    valid: true,
    data: {
      claimer: claimer as string,
      fid: fid as number | bigint,
      deadline: deadline as number | bigint,
    },
  };
}

/**
 * Generates a backend-signed authorization for a claim with nonce.
 * The user receives this signature and submits it with their own transaction.
 */
async function generateClaimAuthorization(params: {
  claimer: string;
  fid: number | bigint;
  deadline: number | bigint;
}) {
  const account = privateKeyToAccount(
    BACKEND_SIGNER_PRIVATE_KEY as `0x${string}`
  );

  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http(),
  });

  const publicClient = createPublicClient({
    chain: base,
    transport: http(),
  });

  const contractAddress = getDailyRewardsAddress(base.id);

  if (!contractAddress) {
    throw new Error("Contract address not configured");
  }

  const nonce = await publicClient.readContract({
    address: contractAddress as `0x${string}`,
    abi: dailyRewardsAbi,
    functionName: "nonces",
    args: [params.claimer as `0x${string}`],
  });

  // Create message hash matching the contract's format with nonce:
  // keccak256(abi.encodePacked(claimer, fid, nonce, deadline, address(this)))
  const messageHash = keccak256(
    encodePacked(
      ["address", "uint256", "uint256", "uint256", "address"],
      [
        params.claimer as `0x${string}`,
        BigInt(params.fid),
        BigInt(nonce.toString()),
        BigInt(params.deadline),
        contractAddress as `0x${string}`,
      ]
    )
  );

  const signature = await walletClient.signMessage({
    message: { raw: messageHash },
  });

  return {
    signature,
    nonce: Number(nonce),
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validation = validateRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: "Missing required fields", missing: validation.missing },
        { status: 400 }
      );
    }

    const { claimer, fid, deadline } = validation.data;

    const { signature, nonce } = await generateClaimAuthorization({
      claimer,
      fid,
      deadline,
    });

    return NextResponse.json({
      signature,
      nonce,
      message: "Claim authorization generated successfully",
    });
  } catch (error) {
    // Claim authorization generation failed - returning error response
    return NextResponse.json(
      {
        error: "Failed to generate claim authorization",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
