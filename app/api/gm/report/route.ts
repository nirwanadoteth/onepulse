import { NextResponse } from "next/server";
import { type Address, createPublicClient, http, isAddress } from "viem";
import { base, celo, optimism } from "viem/chains";

import { dailyGMAbi } from "@/lib/abi/daily-gm";
import { getDailyGmAddress } from "@/lib/constants";
import type { GmStatsByAddress } from "@/lib/module_bindings";
import { callReportGm, getGmRows } from "@/lib/spacetimedb/server-connection";

export const runtime = "nodejs";

function validateAddress(
  address: unknown
): { error: string; status: number } | { value: string } {
  if (typeof address !== "string") {
    return { error: "address is required", status: 400 };
  }
  if (!address) {
    return { error: "address is required", status: 400 };
  }
  if (!isAddress(address)) {
    return { error: "invalid address", status: 400 };
  }
  return { value: address };
}

function validateContractAddress(
  chainId: number
): { error: string; status: number } | { value: string } {
  const contractAddress = getDailyGmAddress(chainId);
  if (!contractAddress) {
    return { error: "DAILY_GM_ADDRESS not configured", status: 500 };
  }
  return { value: contractAddress };
}

function extractOptionalFields(body: Record<string, unknown>) {
  return {
    fid: typeof body.fid === "number" ? body.fid : undefined,
    displayName:
      typeof body.displayName === "string" ? body.displayName : undefined,
    username: typeof body.username === "string" ? body.username : undefined,
    txHash: typeof body.txHash === "string" ? body.txHash : undefined,
  };
}

function validateReportGmRequest(body: Record<string, unknown>) {
  const addressResult = validateAddress(body.address);
  if ("error" in addressResult) {
    return addressResult;
  }

  const chainId = typeof body.chainId === "number" ? body.chainId : 8453;
  const contractResult = validateContractAddress(chainId);
  if ("error" in contractResult) {
    return contractResult;
  }

  return {
    address: addressResult.value,
    chainId,
    contractAddress: contractResult.value,
    ...extractOptionalFields(body),
  };
}

function resolveChain(chainId: number) {
  if (chainId === celo.id) {
    return celo;
  }
  if (chainId === optimism.id) {
    return optimism;
  }
  return base;
}

async function readOnchainLastGmDay(
  address: string,
  contractAddress: string,
  chainId: number
) {
  const chain = resolveChain(chainId);
  const client = createPublicClient({
    chain,
    transport: http(),
  });
  const onchainLastGmDay = await client.readContract({
    address: contractAddress as Address,
    abi: dailyGMAbi,
    functionName: "lastGMDay",
    args: [address as Address],
  });
  return Number(onchainLastGmDay);
}

function formatReportGmResponse(row: GmStatsByAddress) {
  return {
    address: row.address,
    currentStreak: row.currentStreak,
    highestStreak: row.highestStreak,
    allTimeGmCount: row.allTimeGmCount,
    lastGmDay: row.lastGmDay,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = validateReportGmRequest(body);
    if ("error" in validation) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      );
    }
    const {
      address,
      chainId,
      fid,
      displayName,
      username,
      txHash,
      contractAddress,
    } = validation;
    const lastGmDayOnchain = await readOnchainLastGmDay(
      address,
      contractAddress,
      chainId
    );
    const updated = await callReportGm({
      address,
      chainId,
      lastGmDayOnchain,
      txHash,
      fid: typeof fid === "number" ? BigInt(fid) : undefined,
      displayName,
      username,
    });
    const row = updated ?? (await getGmRows(address, chainId)).at(0) ?? null;
    if (!row) {
      return NextResponse.json(
        { error: "spacetimedb_update_failed" },
        { status: 500 }
      );
    }
    return NextResponse.json(formatReportGmResponse(row));
  } catch {
    // Report API error handled with generic response
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
