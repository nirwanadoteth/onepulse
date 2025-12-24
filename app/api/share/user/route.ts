import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { handleError } from "@/lib/error-handling";
import { checkRateLimit, setUserShareData } from "@/lib/kv";

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
 * Checks rate limit for a given identifier and returns a NextResponse if rate limited or on error.
 * Returns null on success, allowing the request to proceed.
 */
async function checkAndHandleRateLimit(options: {
  identifier: string;
  limit: number;
  windowSeconds: number;
  errorMessage: string;
  operation: string;
  context?: Record<string, unknown>;
}): Promise<NextResponse | null> {
  try {
    const { allowed } = await checkRateLimit(
      options.identifier,
      options.limit,
      options.windowSeconds
    );
    if (!allowed) {
      return NextResponse.json(
        { error: options.errorMessage },
        { status: 429 }
      );
    }
    return null;
  } catch (error) {
    handleError(
      error,
      "Rate limit check failed",
      { operation: options.operation, ...options.context },
      { silent: true }
    );
    return NextResponse.json(
      { error: "Rate limit check failed" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  // Extract IP for rate limiting using trusted proxy headers
  // Next.js handles x-forwarded-for safely when NEXTAUTH_URL or similar trusted proxy is configured
  // Parse x-forwarded-for by taking the first comma-separated value (closest client)
  let ip = "";
  const xForwardedFor = req.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    ip = xForwardedFor.split(",")[0]?.trim() || "";
  }
  // Fall back to x-real-ip if x-forwarded-for is unavailable
  if (!ip) {
    const xRealIp = req.headers.get("x-real-ip");
    if (xRealIp) {
      ip = xRealIp.trim();
    }
  }
  // Final fallback to sentinel (prevents "unknown" literal from inflating rate limit keys)
  if (!ip) {
    ip = "unknown";
  }

  // Step 1: Rate limit by IP (global limit)
  const ipRateLimitResponse = await checkAndHandleRateLimit({
    identifier: `ip:${ip}`,
    limit: 100,
    windowSeconds: 60,
    errorMessage: "Too many requests from this IP",
    operation: "share/user/rateLimit",
    context: { ip },
  });
  if (ipRateLimitResponse) {
    return ipRateLimitResponse;
  }

  // Step 2: Parse and validate request body
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

  // Step 3: Rate limit by address (per-address limit)
  const addressRateLimitResponse = await checkAndHandleRateLimit({
    identifier: `address:${normalizedAddress}`,
    limit: 10,
    windowSeconds: 60,
    errorMessage: "Too many updates for this address",
    operation: "share/user/addressRateLimit",
    context: { address: normalizedAddress },
  });
  if (addressRateLimitResponse) {
    return addressRateLimitResponse;
  }

  // Step 4: Store the data
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
      },
      { silent: true }
    );
    return NextResponse.json(
      { error: "Failed to store share user data" },
      { status: 500 }
    );
  }
}
