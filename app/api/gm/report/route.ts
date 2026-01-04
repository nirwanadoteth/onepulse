import { type NextRequest, NextResponse } from "next/server";
import type { Infer } from "spacetimedb";
import { isAddress } from "viem/utils";
import { z } from "zod";
import { dailyGmAddress } from "@/helpers/contracts";
import { BASE_CHAIN_ID, type ChainId } from "@/lib/constants";
import { fetchFarcasterUser, fetchPrimaryWallet } from "@/lib/farcaster";
import type { GmStatsByAddressV2Row } from "@/lib/module_bindings";
import { callReportGm, getGmRows } from "@/lib/spacetimedb/server-connection";

type GmStatsByAddress = Infer<typeof GmStatsByAddressV2Row>;

const reportGmRequestSchema = z.object({
  address: z
    .string()
    .refine((addr) => isAddress(addr), { message: "Invalid Ethereum address" }),
  chainId: z.literal(BASE_CHAIN_ID),
  lastGmDay: z.number().int().positive(),
  fid: z.number().int().positive().optional(),
  displayName: z.string().optional(),
  username: z.string().optional(),
  txHash: z.string().optional(),
});

async function fetchFarcasterEnrichment(fid: number | undefined): Promise<{
  primaryWallet: string | undefined;
  pfpUrl: string | undefined;
}> {
  if (!fid || typeof fid !== "number") {
    return { primaryWallet: undefined, pfpUrl: undefined };
  }

  try {
    const [primaryWallet, farcasterUser] = await Promise.all([
      fetchPrimaryWallet(fid),
      fetchFarcasterUser(fid),
    ]);
    return {
      primaryWallet: primaryWallet || undefined,
      pfpUrl: farcasterUser?.pfp.url || undefined,
    };
  } catch (error) {
    // Log error in development for debugging
    if (process.env.NODE_ENV !== "production") {
      console.error(
        "Error fetching Farcaster enrichment:",
        error instanceof Error ? error.message : error
      );
    }
    // Return empty values and let the request continue
    return { primaryWallet: undefined, pfpUrl: undefined };
  }
}

function formatReportGmResponse(row: GmStatsByAddress) {
  return {
    address: row.address,
    currentStreak: row.currentStreak,
    highestStreak: row.highestStreak,
    allTimeGmCount: row.allTimeGmCount,
    lastGmDay: row.lastGmDay,
    chainId: row.chainId,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = reportGmRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: parseResult.error.issues[0]?.message ?? "Invalid request body",
        },
        { status: 400 }
      );
    }

    const { address, chainId, fid, displayName, lastGmDay, username, txHash } =
      parseResult.data;

    const contractAddress = dailyGmAddress[chainId as ChainId];
    if (!contractAddress) {
      return NextResponse.json(
        { error: "DAILY_GM_ADDRESS not configured" },
        { status: 500 }
      );
    }

    const { primaryWallet, pfpUrl } = await fetchFarcasterEnrichment(fid);

    const updated = await callReportGm({
      address,
      chainId,
      lastGmDayOnchain: lastGmDay,
      txHash,
      fid: typeof fid === "number" ? BigInt(fid) : undefined,
      displayName,
      username,
      primaryWallet,
      pfpUrl,
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

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    if (process.env.NODE_ENV !== "production") {
      console.error("Error in /api/gm/report:", errorMessage);
      response.message = errorMessage;
    }

    return NextResponse.json(response, { status: 500 });
  }
}
