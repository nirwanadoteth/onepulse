import { type NextRequest, NextResponse } from "next/server";
import {
  type Chain,
  createPublicClient,
  createWalletClient,
  encodePacked,
  http,
  keccak256,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, celo, optimism } from "viem/chains";

import { dailyRewardsV2Abi } from "@/lib/abi/daily-rewards-v2";
import {
  BASE_CHAIN_ID,
  CELO_CHAIN_ID,
  OPTIMISM_CHAIN_ID,
} from "@/lib/constants";
import { getDailyRewardsAddress } from "@/lib/utils";

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
    chainId: number;
  };
};

type ValidationFailure = {
  valid: false;
  missing: string[];
};

function validateRequest(
  body: Record<string, unknown>
): ValidationSuccess | ValidationFailure {
  const { claimer, fid, deadline, chainId } = body;
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
  if (!chainId) {
    missing.push("chainId");
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
      chainId: Number(chainId),
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
  chainId: number;
}) {
  const account = privateKeyToAccount(
    BACKEND_SIGNER_PRIVATE_KEY as `0x${string}`
  );

  // Select the correct chain based on chainId
  const chainMap: Record<number, Chain> = {
    [BASE_CHAIN_ID]: base,
    [CELO_CHAIN_ID]: celo,
    [OPTIMISM_CHAIN_ID]: optimism,
  };

  const chain = chainMap[params.chainId] ?? base;

  const walletClient = createWalletClient({
    account,
    chain,
    transport: http(),
  });

  const publicClient = createPublicClient({
    chain,
    transport: http(),
  });

  const contractAddress = getDailyRewardsAddress(params.chainId);

  if (!contractAddress) {
    throw new Error("Contract address not configured");
  }

  const nonce = await publicClient.readContract({
    address: contractAddress as `0x${string}`,
    abi: dailyRewardsV2Abi,
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

    const { claimer, fid, deadline, chainId } = validation.data;

    const authResult = await generateClaimAuthorization({
      claimer,
      fid,
      deadline,
      chainId,
    });

    return NextResponse.json({
      signature: authResult.signature,
      nonce: authResult.nonce,
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
