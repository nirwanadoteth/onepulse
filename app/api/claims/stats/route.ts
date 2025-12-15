import { type NextRequest, NextResponse } from "next/server";
import { handleError } from "@/lib/error-handling";
import { checkRateLimit, getDailyClaimsCount } from "@/lib/kv";

export const dynamic = "force-dynamic";

const CLAIM_STATS_RATE_LIMIT_MAX_REQUESTS = 60;
const CLAIM_STATS_RATE_LIMIT_WINDOW_SECONDS = 60;

export async function GET(req: NextRequest): Promise<NextResponse> {
  // Extract IP for rate limiting
  // Parse x-forwarded-for by taking the first comma-separated value and trimming
  let ip = "";

  const xForwardedFor = req.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    ip = xForwardedFor.split(",")[0]?.trim() || "";
  }

  // Fall back to x-real-ip if available
  if (!ip) {
    const xRealIp = req.headers.get("x-real-ip");
    if (xRealIp) {
      ip = xRealIp.trim();
    }
  }

  // Only apply rate limiting if we have a valid IP address
  // Skip rate limiting for requests without identifiable source IP
  if (ip) {
    try {
      const { allowed } = await checkRateLimit(
        `ip:claims-stats:${ip}`,
        CLAIM_STATS_RATE_LIMIT_MAX_REQUESTS,
        CLAIM_STATS_RATE_LIMIT_WINDOW_SECONDS
      );
      if (!allowed) {
        return NextResponse.json(
          { error: "Too many requests. Please try again later." },
          {
            status: 429,
            headers: {
              "Cache-Control": "no-store",
              "Retry-After": String(CLAIM_STATS_RATE_LIMIT_WINDOW_SECONDS),
            },
          }
        );
      }
    } catch (error) {
      handleError(
        error,
        "Rate limit check failed",
        { operation: "claims/stats/rateLimit", ip },
        { silent: true }
      );
      // On rate limit check failure, fail open (allow request to proceed)
      // to avoid breaking the endpoint due to KV issues
    }
  }

  try {
    const count = await getDailyClaimsCount();
    const response = NextResponse.json({ count });
    // Disable caching to ensure fresh data for real-time claim counts
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate"
    );
    return response;
  } catch (error) {
    handleError(
      error,
      "Error fetching claim stats",
      {
        operation: "claims/stats",
      },
      { silent: true }
    );
    return NextResponse.json(
      { error: "Failed to fetch claim stats" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
