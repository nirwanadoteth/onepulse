import {
  type SendNotificationRequest,
  sendNotificationResponseSchema,
} from "@farcaster/miniapp-sdk";

import { handleError } from "@/lib/error-handling";
import { getUserNotificationDetails } from "@/lib/kv";

const appUrl = process.env.NEXT_PUBLIC_URL || "";

// Allowlist of permitted notification service hostnames
const NOTIFICATION_ENDPOINT_ALLOWLIST = ["api.farcaster.xyz", "api.neynar.com"];

type sendMiniAppNotificationResult =
  | {
      state: "error";
      error: unknown;
    }
  | { state: "no_token" }
  | { state: "rate_limit" }
  | { state: "success" };

/**
 * Validates a notification endpoint URL to ensure it is safe to fetch from.
 * Requirements:
 * - Must be a valid absolute URL
 * - Must use HTTPS protocol
 * - Hostname must be in the allowlist
 * - Must not be a private IP address or localhost
 */
function validateNotificationUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);

    // Require HTTPS
    if (url.protocol !== "https:") {
      return false;
    }

    // Check against allowlist
    const hostname = url.hostname.toLowerCase();
    if (!NOTIFICATION_ENDPOINT_ALLOWLIST.includes(hostname)) {
      return false;
    }

    // Block private IP ranges and localhost
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "[::1]" ||
      hostname.startsWith("10.") ||
      hostname.startsWith("172.16.") ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("fc00::") // IPv6 unique local
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function sendMiniAppNotification({
  fid,
  appFid,
  title,
  body,
  notificationId,
}: {
  fid: number;
  appFid: number;
  title: string;
  body: string;
  notificationId?: string;
}): Promise<sendMiniAppNotificationResult> {
  let notificationDetails: Awaited<
    ReturnType<typeof getUserNotificationDetails>
  >;
  try {
    notificationDetails = await getUserNotificationDetails(fid, appFid);
  } catch (error) {
    handleError(
      error,
      "Failed to read notification details",
      { operation: "notifications/getUserNotificationDetails", fid, appFid },
      { silent: true }
    );
    return { state: "error", error };
  }
  if (!notificationDetails) {
    return { state: "no_token" };
  }

  // Validate the notification URL before attempting to fetch
  if (!validateNotificationUrl(notificationDetails.url)) {
    handleError(
      new Error("Invalid notification endpoint URL"),
      "Notification URL validation failed",
      {
        operation: "notifications/validateUrl",
        fid,
        appFid,
        url: notificationDetails.url,
      },
      { silent: true }
    );
    return { state: "error", error: "Invalid notification endpoint URL" };
  }

  let response: Response;
  let responseJson: unknown;
  try {
    response = await fetch(notificationDetails.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        notificationId: notificationId ?? crypto.randomUUID(),
        title,
        body,
        targetUrl: appUrl,
        tokens: [notificationDetails.token],
      } satisfies SendNotificationRequest),
    });

    responseJson = await response.json();
  } catch (error) {
    handleError(
      error,
      "Failed to send notification",
      { operation: "notifications/fetch", fid, appFid },
      { silent: true }
    );
    return { state: "error", error };
  }

  if (response.status === 200) {
    const responseBody = sendNotificationResponseSchema.safeParse(responseJson);
    if (responseBody.success === false) {
      return { state: "error", error: responseBody.error.errors };
    }

    if (responseBody.data.result.rateLimitedTokens.length) {
      return { state: "rate_limit" };
    }

    return { state: "success" };
  }
  return { state: "error", error: responseJson };
}
