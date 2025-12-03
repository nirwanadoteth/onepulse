import { createClient, Errors } from "@farcaster/quick-auth";
import type { NextRequest } from "next/server";

const client = createClient();

type VerifyResult =
  | { success: true; fid: number; issuedAt?: number; expiresAt?: number }
  | { success: false; error: string; status: 401 | 500 };

function getUrlHost(request: NextRequest): string {
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      const url = new URL(origin);
      return url.host;
    } catch {
      // Invalid origin header, fallback to other methods
    }
  }

  const host = request.headers.get("host");
  if (host) {
    return host;
  }

  let urlValue: string;
  if (process.env.VERCEL_ENV === "production") {
    urlValue =
      process.env.NEXT_PUBLIC_URL || "https://onepulse-ruby.vercel.app";
  } else if (process.env.VERCEL_URL) {
    urlValue = `https://${process.env.VERCEL_URL}`;
  } else {
    urlValue = "http://localhost:3000";
  }

  const url = new URL(urlValue);
  return url.host;
}

/**
 * Verifies a Farcaster Quick Auth JWT token from the Authorization header.
 * Use this to securely get the user's FID on the server side.
 *
 * @example
 * ```ts
 * const result = await verifyQuickAuth(request);
 * if (!result.success) {
 *   return NextResponse.json({ error: result.error }, { status: result.status });
 * }
 * const { fid } = result;
 * ```
 */
export async function verifyQuickAuth(
  request: NextRequest
): Promise<VerifyResult> {
  const authorization = request.headers.get("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return {
      success: false,
      error: "Missing or invalid authorization token",
      status: 401,
    };
  }

  try {
    const token = authorization.split(" ")[1];
    if (!token) {
      return { success: false, error: "Missing token", status: 401 };
    }

    const payload = await client.verifyJwt({
      token,
      domain: getUrlHost(request),
    });

    return {
      success: true,
      fid: payload.sub,
      issuedAt: payload.iat,
      expiresAt: payload.exp,
    };
  } catch (e) {
    if (e instanceof Errors.InvalidTokenError) {
      return { success: false, error: "Invalid token", status: 401 };
    }
    if (e instanceof Error) {
      return { success: false, error: e.message, status: 500 };
    }
    return { success: false, error: "Token verification failed", status: 500 };
  }
}
