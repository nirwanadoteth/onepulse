import { type NextRequest, NextResponse } from "next/server";
import type { Infer } from "spacetimedb";
import { type Address, createPublicClient, http, isAddress } from "viem";
import { base, celo, optimism } from "viem/chains";
import { z } from "zod";
import { dailyGMAbi } from "@/lib/abi/daily-gm";
import type GmStatsByAddressSchema from "@/lib/module_bindings/gm_stats_by_address_table";
import { callReportGm, getGmRows } from "@/lib/spacetimedb/server-connection";
import { getDailyGmAddress } from "@/lib/utils";

type GmStatsByAddress = Infer<typeof GmStatsByAddressSchema>;

const reportGmRequestSchema = z.object({
  address: z
    .string()
    .refine((addr) => isAddress(addr), { message: "Invalid Ethereum address" }),
  chainId: z.number().int().positive(),
  fid: z.number().int().positive().optional(),
  displayName: z.string().optional(),
  username: z.string().optional(),
  txHash: z.string().optional(),
});

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

  // Add a small delay for Celo to ensure block propagation
  if (chainId === celo.id) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  const client = createPublicClient({
    chain,
    transport: http(),
  });

  let onchainLastGmDay: bigint | undefined;
  let attempt = 0;
  const maxAttempts = 3;

  // Retry logic for Celo to handle RPC inconsistency
  while (attempt < maxAttempts) {
    try {
      onchainLastGmDay = await client.readContract({
        address: contractAddress as Address,
        abi: dailyGMAbi,
        functionName: "lastGMDay",
        args: [address as Address],
      });

      if (onchainLastGmDay !== undefined && onchainLastGmDay !== BigInt(0)) {
        break;
      }
    } catch {
      attempt += 1;
      if (attempt >= maxAttempts) {
        throw new Error(
          `Failed to read lastGMDay after ${maxAttempts} attempts`
        );
      }
      // Wait before retrying, with exponential backoff
      await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** attempt));
    }
  }

  return Number(onchainLastGmDay ?? 0);
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

    const { address, chainId, fid, displayName, username, txHash } =
      parseResult.data;

    const contractAddress = getDailyGmAddress(chainId);
    if (!contractAddress) {
      return NextResponse.json(
        { error: "DAILY_GM_ADDRESS not configured" },
        { status: 500 }
      );
    }

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
