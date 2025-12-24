import { type NextRequest, NextResponse } from "next/server";
import { type Address, createPublicClient, http, isAddress } from "viem";
import { base } from "viem/chains";
import { z } from "zod";
import { dailyRewardsV2Abi } from "@/lib/abi/daily-rewards-v2";
import { handleError } from "@/lib/error-handling";
import { getHiddenChains, toggleChainVisibility } from "@/lib/kv";
import { getDailyRewardsV2Address } from "@/lib/utils";

const toggleVisibilitySchema = z.object({
  chainId: z.number(),
  adminAddress: z.string().refine(isAddress, "Invalid address"),
});

/**
 * Verify that the requesting address is the contract owner
 */
async function verifyAdmin(address: string): Promise<boolean> {
  try {
    const contractAddress = getDailyRewardsV2Address(base.id);
    if (!contractAddress) {
      return false;
    }

    const publicClient = createPublicClient({
      chain: base,
      transport: http(),
    });

    const owner = await publicClient.readContract({
      address: contractAddress as Address,
      abi: dailyRewardsV2Abi,
      functionName: "owner",
    });

    return owner.toLowerCase() === address.toLowerCase();
  } catch (error) {
    handleError(
      error,
      "Failed to verify admin",
      { operation: "admin/verifyAdmin", address },
      { silent: true }
    );
    return false;
  }
}

/**
 * GET /api/admin/chains/visibility
 * Returns the list of currently hidden chains
 */
export async function GET(req: NextRequest) {
  try {
    const adminAddress = req.nextUrl.searchParams.get("adminAddress");

    if (!(adminAddress && isAddress(adminAddress))) {
      return NextResponse.json(
        { error: "Invalid admin address" },
        { status: 400 }
      );
    }

    const isAdmin = await verifyAdmin(adminAddress);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized: Not contract owner" },
        { status: 403 }
      );
    }

    const hiddenChains = await getHiddenChains();
    return NextResponse.json({ hiddenChains });
  } catch (error) {
    handleError(
      error,
      "Failed to get hidden chains",
      { operation: "admin/chains/visibility" },
      { silent: true }
    );
    return NextResponse.json(
      { error: "Failed to get hidden chains" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/chains/visibility
 * Toggle visibility of a specific chain (admin only)
 */
export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = toggleVisibilitySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { chainId, adminAddress } = parsed.data;

    // Verify the user is the contract owner
    const isAdmin = await verifyAdmin(adminAddress);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized: Not contract owner" },
        { status: 403 }
      );
    }

    const result = await toggleChainVisibility(chainId);

    return NextResponse.json({
      success: true,
      chainId,
      hidden: result.hidden,
      allHiddenChains: result.allHiddenChains,
    });
  } catch (error) {
    handleError(
      error,
      "Failed to toggle chain visibility",
      { operation: "admin/chains/visibility" },
      { silent: true }
    );
    return NextResponse.json(
      { error: "Failed to toggle chain visibility" },
      { status: 500 }
    );
  }
}
