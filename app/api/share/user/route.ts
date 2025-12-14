import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { handleError } from "@/lib/error-handling";
import { checkRateLimit, setUserShareData } from "@/lib/kv";
import { verifyQuickAuth } from "@/lib/quick-auth";

// Constraints to prevent abuse and injection
const MAX_USERNAME_LENGTH = 100;
const MAX_DISPLAY_NAME_LENGTH = 150;
const MAX_PFP_URL_LENGTH = 2048;

const shareUserRequestSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  data: z.object({
    username: z.string().min(1).max(MAX_USERNAME_LENGTH),
    displayName: z.string().min(1).max(MAX_DISPLAY_NAME_LENGTH),
    pfp: z.string().url().max(MAX_PFP_URL_LENGTH).optional(),
  }),
});

/**
 * Verifies that the authenticated user has permission to update share data for the given address.
 * Currently uses Farcaster authentication as a trust signal.
 * Future: Could require a signature proof that the user controls the address.
 */
function authorizeAddressUpdate(authenticatedFid: number): boolean {
  // If no authenticated user, deny access
  if (!authenticatedFid) {
    return false;
  }

  // Currently, we trust any authenticated Farcaster user to set their own share data.
  // TODO: Implement signature verification to prove address ownership:
  // - Require a signed message from the address
  // - Verify the signature matches the address
  // - Bind the update to the specific FID+address combination
  return true;
}

export async function POST(req: NextRequest) {
  // Extract IP for rate limiting
  const ip =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "unknown";

  // Step 1: Authenticate via Quick Auth
  const authResult = await verifyQuickAuth(req);
  if (!authResult.success) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid or missing authentication" },
      { status: 401 }
    );
  }

  // Step 2: Rate limit by IP (global limit)
  try {
    const { allowed: ipAllowed } = await checkRateLimit(
      `ip:${ip}`,
      100, // 100 requests
      60 // per 60 seconds
    );
    if (!ipAllowed) {
      return NextResponse.json(
        { error: "Too many requests from this IP" },
        { status: 429 }
      );
    }
  } catch (error) {
    handleError(
      error,
      "Rate limit check failed",
      { operation: "share/user/rateLimit", ip },
      { silent: true }
    );
    return NextResponse.json(
      { error: "Rate limit check failed" },
      { status: 500 }
    );
  }

  // Step 3: Parse and validate request body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = shareUserRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const normalizedAddress = parsed.data.address.toLowerCase();

  // Step 4: Rate limit by address (per-address limit)
  try {
    const { allowed: addressAllowed } = await checkRateLimit(
      `address:${normalizedAddress}`,
      10, // 10 requests
      60 // per 60 seconds
    );
    if (!addressAllowed) {
      return NextResponse.json(
        { error: "Too many updates for this address" },
        { status: 429 }
      );
    }
  } catch (error) {
    handleError(
      error,
      "Rate limit check failed",
      { operation: "share/user/addressRateLimit", address: normalizedAddress },
      { silent: true }
    );
    return NextResponse.json(
      { error: "Rate limit check failed" },
      { status: 500 }
    );
  }

  // Step 5: Authorize address update (verify user has permission)
  if (!authorizeAddressUpdate(authResult.fid)) {
    return NextResponse.json(
      { error: "Forbidden: No permission to update this address" },
      { status: 403 }
    );
  }

  // Step 6: Store the data
  try {
    await setUserShareData(normalizedAddress, parsed.data.data);
    return NextResponse.json({ success: true });
  } catch (error) {
    handleError(
      error,
      "Failed to store share user data",
      {
        operation: "share/user",
        address: normalizedAddress,
        fid: authResult.fid,
      },
      { silent: true }
    );
    return NextResponse.json(
      { error: "Failed to store share user data" },
      { status: 500 }
    );
  }
}
