import { type NextRequest, NextResponse } from "next/server";
import type { Infer } from "spacetimedb";
import { isAddress } from "viem";
import type GmStatsByAddressSchema from "@/lib/module_bindings/gm_stats_by_address_table";

import { getGmRows } from "@/lib/spacetimedb/server-connection";

type GmStatsByAddress = Infer<typeof GmStatsByAddressSchema>;

export const runtime = "nodejs";

function validateGmStatsQuery(searchParams: URLSearchParams) {
  const address = searchParams.get("address") || "";
  const chainIdParam = searchParams.get("chainId");
  const chainId = chainIdParam ? Number(chainIdParam) : undefined;
  if (!address) {
    return { error: "address is required", status: 400 };
  }
  if (!isAddress(address)) {
    return { error: "invalid address", status: 400 };
  }
  return { address, chainId };
}

function formatChainStatsResponse(
  address: string,
  stats: GmStatsByAddress | undefined
) {
  return {
    address,
    currentStreak: stats?.currentStreak ?? 0,
    highestStreak: stats?.highestStreak ?? 0,
    allTimeGmCount: stats?.allTimeGmCount ?? 0,
    lastGmDay: stats?.lastGmDay ?? 0,
  };
}

function formatAggregateStatsResponse(
  address: string,
  rows: GmStatsByAddress[]
) {
  const allTimeGmCount = rows.reduce(
    (acc, r) => acc + (r.allTimeGmCount ?? 0),
    0
  );
  const highestStreak = rows.reduce(
    (acc, r) => Math.max(acc, r.highestStreak ?? 0),
    0
  );
  const lastGmDay = rows.reduce((acc, r) => Math.max(acc, r.lastGmDay ?? 0), 0);
  return {
    address,
    currentStreak: 0,
    highestStreak,
    allTimeGmCount,
    lastGmDay,
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const validation = validateGmStatsQuery(searchParams);
  if ("error" in validation) {
    return NextResponse.json(
      { error: validation.error },
      { status: validation.status }
    );
  }
  const { address, chainId } = validation;
  const rows = await getGmRows(address, chainId);
  if (typeof chainId === "number" && !Number.isNaN(chainId)) {
    return NextResponse.json(formatChainStatsResponse(address, rows[0]));
  }
  return NextResponse.json(formatAggregateStatsResponse(address, rows));
}
