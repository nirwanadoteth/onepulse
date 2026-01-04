import type { MiniAppNotificationDetails } from "@/types/miniapp";
import "server-only";
import { Redis } from "@upstash/redis";

import { handleError } from "@/lib/error-handling";

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

function reportKvError(
  error: unknown,
  kvOperation: string,
  context: Record<string, unknown>
): void {
  handleError(
    error,
    "KV operation failed",
    {
      operation: "kv",
      kvOperation,
      ...context,
    },
    { silent: true }
  );
}

function getUserNotificationDetailsKey(fid: number, appFid: number): string {
  return `onepulse:user:${appFid}:${fid}`;
}

export async function getUserNotificationDetails(
  fid: number,
  appFid: number
): Promise<MiniAppNotificationDetails | null> {
  try {
    return await redis.get<MiniAppNotificationDetails>(
      getUserNotificationDetailsKey(fid, appFid)
    );
  } catch (error) {
    reportKvError(error, "getUserNotificationDetails", { fid, appFid });
    throw error;
  }
}

export async function setUserNotificationDetails(
  fid: number,
  appFid: number,
  notificationDetails: MiniAppNotificationDetails
): Promise<void> {
  try {
    await redis.set(
      getUserNotificationDetailsKey(fid, appFid),
      notificationDetails
    );
  } catch (error) {
    reportKvError(error, "setUserNotificationDetails", { fid, appFid });
    throw error;
  }
}

export async function deleteUserNotificationDetails(
  fid: number,
  appFid: number
): Promise<void> {
  try {
    await redis.del(getUserNotificationDetailsKey(fid, appFid));
  } catch (error) {
    reportKvError(error, "deleteUserNotificationDetails", { fid, appFid });
    throw error;
  }
}
