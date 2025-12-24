import { NextResponse } from "next/server";
import { handleError } from "@/lib/error-handling";
import { getHiddenChains } from "@/lib/kv";

/**
 * GET /api/chains/visibility
 * Public endpoint to get list of hidden chains
 */
export async function GET() {
  try {
    const hiddenChains = await getHiddenChains();
    return NextResponse.json({ hiddenChains });
  } catch (error) {
    handleError(
      error,
      "Failed to get hidden chains",
      { operation: "chains/visibility" },
      { silent: true }
    );
    return NextResponse.json(
      { error: "Failed to get hidden chains" },
      { status: 500 }
    );
  }
}
