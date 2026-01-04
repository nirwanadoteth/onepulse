import { type NextRequest, NextResponse } from "next/server";
import type { Infer } from "spacetimedb";
import { isAddress } from "viem/utils";
import { z } from "zod";
import { BASE_CHAIN_ID } from "@/lib/constants";
import type { GmStatsByAddressV2Row } from "@/lib/module_bindings";
import { getGmRows } from "@/lib/spacetimedb/server-connection";

type GmStatsByAddress = Infer<typeof GmStatsByAddressV2Row>;

const gmStatsQuerySchema = z.object({
  address: z
    .string()
    .nullish()
    .refine((addr) => !addr || isAddress(addr), {
      message: "Invalid Ethereum address",
    }),
});

function formatCombinedStatsResponse(
  address: string,
  rows: GmStatsByAddress[]
) {
  const stats: Record<string, Record<string, unknown>> = {};
  const baseRow = rows.find((r) => r.chainId === BASE_CHAIN_ID);

  if (baseRow) {
    stats[String(BASE_CHAIN_ID)] = {
      name: "Base",
      currentStreak: baseRow.currentStreak ?? 0,
      highestStreak: baseRow.highestStreak ?? 0,
      allTimeGmCount: baseRow.allTimeGmCount ?? 0,
      lastGmDay: baseRow.lastGmDay ?? 0,
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
