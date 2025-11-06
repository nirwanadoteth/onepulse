import { NextRequest, NextResponse } from "next/server"
import {
  createWalletClient,
  http,
  keccak256,
  encodePacked,
} from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { base } from "viem/chains"

import { getDailyRewardsAddress } from "@/lib/constants"

// Backend signer for claim authorizations (not for executing transactions)
const BACKEND_SIGNER_PRIVATE_KEY = process.env.BACKEND_SIGNER_PRIVATE_KEY

if (!BACKEND_SIGNER_PRIVATE_KEY) {
  console.warn("BACKEND_SIGNER_PRIVATE_KEY not configured")
}

type ValidationSuccess = {
  valid: true
  data: {
    claimer: string
    fid: number | bigint
    deadline: number | bigint
  }
}

type ValidationFailure = {
  valid: false
  missing: string[]
}

function validateRequest(
  body: Record<string, unknown>
): ValidationSuccess | ValidationFailure {
  const { claimer, fid, deadline } = body
  const missing = []

  if (!claimer) missing.push("claimer")
  if (!fid) missing.push("fid")
  if (!deadline) missing.push("deadline")

  if (missing.length > 0) {
    return { valid: false, missing }
  }

  return {
    valid: true,
    data: {
      claimer: claimer as string,
      fid: fid as number | bigint,
      deadline: deadline as number | bigint,
    },
  }
}

/**
 * Generates a backend-signed authorization for a claim.
 * The user receives this signature and submits it with their own transaction.
 * This works with all wallet types (EOA, smart wallet, passkey, etc.)
 */
async function generateClaimAuthorization(params: {
  claimer: string
  fid: number | bigint
  deadline: number | bigint
}) {
  const account = privateKeyToAccount(
    BACKEND_SIGNER_PRIVATE_KEY as `0x${string}`
  )

  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http(),
  })

  const contractAddress = getDailyRewardsAddress(base.id)

  if (!contractAddress) {
    throw new Error("Contract address not configured")
  }

  // Create message hash matching the contract's format:
  // keccak256(abi.encodePacked(claimer, fid, deadline, address(this)))
  const messageHash = keccak256(
    encodePacked(
      ["address", "uint256", "uint256", "address"],
      [
        params.claimer as `0x${string}`,
        BigInt(params.fid),
        BigInt(params.deadline),
        contractAddress as `0x${string}`,
      ]
    )
  )

  // Sign with personal_sign (adds "\x19Ethereum Signed Message:\n32" prefix)
  // This is simpler than EIP-712 and works with all wallet types
  const signature = await walletClient.signMessage({
    account,
    message: { raw: messageHash },
  })

  return {
    signature,
    messageHash,
    deadline: params.deadline,
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!BACKEND_SIGNER_PRIVATE_KEY) {
      return NextResponse.json(
        { error: "Backend signer not configured" },
        { status: 500 }
      )
    }

    const body = await req.json()
    const validation = validateRequest(body)

    if (!validation.valid) {
      return NextResponse.json(
        {
          error: "Missing required parameters",
          missing: validation.missing,
        },
        { status: 400 }
      )
    }

    const result = await generateClaimAuthorization(validation.data)

    return NextResponse.json({
      success: true,
      signature: result.signature,
      deadline: result.deadline,
      messageHash: result.messageHash,
    })
  } catch (error: unknown) {
    console.error("Claim authorization error:", error)

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error"
    const errorDetails = error as { shortMessage?: string; details?: string }

    return NextResponse.json(
      {
        error: "Failed to generate claim authorization",
        message: errorMessage,
        details:
          errorDetails?.shortMessage || errorDetails?.details || undefined,
      },
      { status: 500 }
    )
  }
}
