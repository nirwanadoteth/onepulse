import { type NextRequest, NextResponse } from "next/server";
import type { Infer } from "spacetimedb";
import { type Address, createPublicClient, http, isAddress } from "viem";
import { base, celo, optimism } from "viem/chains";
import { dailyGMAbi } from "@/lib/abi/daily-gm";
import type GmStatsByAddressSchema from "@/lib/module_bindings/gm_stats_by_address_table";
import { getOptionalVerifiedFid } from "@/lib/quick-auth";
import { callReportGm, getGmRows } from "@/lib/spacetimedb/server-connection";
import { getDailyGmAddress, normalizeChainId } from "@/lib/utils";

type GmStatsByAddress = Infer<typeof GmStatsByAddressSchema>;

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

  const normalizedChainId = normalizeChainId(body.chainId);
  if (!normalizedChainId) {
    return { error: "invalid chainId", status: 400 };
  }
  const chainId = normalizedChainId;
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

export async function POST(req: NextRequest) {
  try {
    // Get verified FID from Quick Auth if available (safer than trusting client-provided FID)
    const verifiedFid = await getOptionalVerifiedFid(req);

    const body = await req.json();
    const validation = validateReportGmRequest(body);
    if ("error" in validation) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      );
    }
    const { address, chainId, displayName, username, txHash, contractAddress } =
      validation;

    // Use verified FID if available, otherwise fall back to body.fid for backwards compatibility
    const fid = verifiedFid ?? validation.fid;

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
  } catch (error) {
    const response: { error: string; message?: string } = {
      error: "internal error",
    };

    if (process.env.NODE_ENV !== "production") {
      response.message =
        error instanceof Error ? error.message : "Unknown error";
    }

    return NextResponse.json(response, { status: 500 });
  }
}
