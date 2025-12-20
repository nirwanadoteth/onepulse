import { type NextRequest, NextResponse } from "next/server";
import type { Infer } from "spacetimedb";
import { isAddress } from "viem";
import { z } from "zod";
import { SUPPORTED_CHAINS } from "@/lib/constants";
import type GmStatsByAddressSchema from "@/lib/module_bindings/gm_stats_by_address_table";

import { getGmRows } from "@/lib/spacetimedb/server-connection";

type GmStatsByAddress = Infer<typeof GmStatsByAddressSchema>;

export const runtime = "nodejs";

const gmStatsQuerySchema = z.object({
  address: z
    .string()
    .nullish()
    .refine((addr) => !addr || isAddress(addr), {
      message: "Invalid Ethereum address",
    }),
});

function getChainName(chainId: number): string {
  return SUPPORTED_CHAINS.find((c) => c.id === chainId)?.name || "Unknown";
}

function formatCombinedStatsResponse(
  address: string,
  rows: GmStatsByAddress[]
) {
  const stats: Record<string, Record<string, unknown>> = {};
  for (const r of rows) {
    stats[String(r.chainId)] = {
      name: getChainName(r.chainId),
      currentStreak: r.currentStreak ?? 0,
      highestStreak: r.highestStreak ?? 0,
      allTimeGmCount: r.allTimeGmCount ?? 0,
      lastGmDay: r.lastGmDay ?? 0,
    };
  }
  return {
    address,
    stats,
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const parseResult = gmStatsQuerySchema.safeParse({
    address: searchParams.get("address"),
  });

  if (!parseResult.success) {
    return NextResponse.json(
      { error: parseResult.error.issues[0]?.message ?? "Invalid parameters" },
      { status: 400 }
    );
  }

  const { address } = parseResult.data;

  if (!address) {
    return NextResponse.json(
      { error: "Missing required parameter: address" },
      { status: 400 }
    );
  }

  const rows = await getGmRows(address);
  return NextResponse.json(formatCombinedStatsResponse(address, rows));
}
