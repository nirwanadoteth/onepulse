import { NextResponse } from "next/server"
import { createPublicClient, http, isAddress, type Address } from "viem"
import { base } from "viem/chains"

import { dailyRewardsAbi } from "@/lib/abi/daily-rewards"
import { getDailyRewardsAddress } from "@/lib/constants"
import type { GmStatsByAddress } from "@/lib/module_bindings"
import { callReportGm, getGmRows } from "@/lib/spacetimedb/server-connection"

export const runtime = "nodejs"

function validateAddress(
  address: unknown
): { error: string; status: number } | { value: string } {
  if (typeof address !== "string")
    return { error: "address is required", status: 400 }
  if (!address) return { error: "address is required", status: 400 }
  if (!isAddress(address)) return { error: "invalid address", status: 400 }
  return { value: address }
}

function validateFid(
  fid: unknown
): { error: string; status: number } | { value: number } {
  if (typeof fid !== "number" && typeof fid !== "string") {
    return { error: "fid is required", status: 400 }
  }
  const fidNum = typeof fid === "string" ? parseInt(fid, 10) : fid
  if (!Number.isInteger(fidNum) || fidNum <= 0) {
    return { error: "fid must be a positive integer", status: 400 }
  }
  return { value: fidNum }
}

function validateTxHash(
  txHash: unknown
): { error: string; status: number } | { value: string } {
  if (typeof txHash !== "string") {
    return { error: "txHash is required", status: 400 }
  }
  if (!txHash.startsWith("0x")) {
    return { error: "invalid txHash format", status: 400 }
  }
  return { value: txHash }
}

async function readOnchainLastClaimDay(
  address: string,
  contractAddress: string
) {
  const client = createPublicClient({
    chain: base,
    transport: http(),
  })

  const userInfo = await client.readContract({
    address: contractAddress as Address,
    abi: dailyRewardsAbi,
    functionName: "userInfo",
    args: [address as Address],
  })

  return Number(userInfo[0]) // lastClaimDay is first element
}

function formatReportClaimResponse(row: GmStatsByAddress) {
  return {
    address: row.address,
    chainId: row.chainId,
    allTimeGmCount: row.allTimeGmCount,
    currentStreak: row.currentStreak,
    highestStreak: row.highestStreak,
    lastGmDay: row.lastGmDay,
    fid: row.fid ? Number(row.fid) : null,
    displayName: row.displayName,
    username: row.username,
    updatedAt: row.updatedAt,
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Validate required fields
    const addressValidation = validateAddress(body.address)
    if ("error" in addressValidation) {
      return NextResponse.json(
        { error: addressValidation.error },
        { status: addressValidation.status }
      )
    }

    const fidValidation = validateFid(body.fid)
    if ("error" in fidValidation) {
      return NextResponse.json(
        { error: fidValidation.error },
        { status: fidValidation.status }
      )
    }

    const txHashValidation = validateTxHash(body.txHash)
    if ("error" in txHashValidation) {
      return NextResponse.json(
        { error: txHashValidation.error },
        { status: txHashValidation.status }
      )
    }

    const { value: address } = addressValidation
    const { value: fid } = fidValidation
    const { value: txHash } = txHashValidation

    const contractAddress = getDailyRewardsAddress(8453)
    if (!contractAddress) {
      return NextResponse.json(
        { error: "Daily rewards contract not configured" },
        { status: 500 }
      )
    }

    // Get on-chain last claim day
    const lastClaimDayOnchain = await readOnchainLastClaimDay(
      address,
      contractAddress
    )

    // Report to SpacetimeDB (reusing GM reporting infrastructure for now)
    // This tracks the claim event for analytics
    const updated = await callReportGm({
      address,
      chainId: 8453,
      lastGmDayOnchain: lastClaimDayOnchain,
      txHash,
      fid: BigInt(fid),
      displayName: body.displayName,
      username: body.username,
    })

    const row = updated ?? (await getGmRows(address, 8453)).at(0) ?? null

    if (!row) {
      return NextResponse.json(
        { error: "Failed to record claim", status: 500 },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: formatReportClaimResponse(row),
    })
  } catch (error) {
    console.error("Claim report error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
