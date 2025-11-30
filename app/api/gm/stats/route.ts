import { type NextRequest, NextResponse } from "next/server";
import type { Infer } from "spacetimedb";
import { isAddress } from "viem";
import { SUPPORTED_CHAINS } from "@/lib/constants";
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

function getChainName(chainId: number): string {
  return SUPPORTED_CHAINS.find((c) => c.id === chainId)?.name || "Unknown";
}

function formatChainStatsResponse(
  address: string,
  stats: GmStatsByAddress | undefined
) {
  const count = stats?.allTimeGmCount ?? 0;
  const chainId = stats?.chainId ?? 0;
  return {
    address,
    currentStreak: stats?.currentStreak ?? 0,
    highestStreak: stats?.highestStreak ?? 0,
    allTimeGmCount: count,
    lastGmDay: stats?.lastGmDay ?? 0,
    chains: chainId ? [{ name: getChainName(chainId), count }] : [],
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

  const chains = rows
    .map((r) => ({
      name: getChainName(r.chainId),
      count: r.allTimeGmCount ?? 0,
    }))
    .filter((c) => c.count > 0);

  return {
    address,
    currentStreak: 0,
    highestStreak,
    allTimeGmCount,
    lastGmDay,
    chains,
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
