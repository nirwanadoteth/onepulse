import type { MiniAppNotificationDetails } from "@farcaster/miniapp-sdk";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

function getUserNotificationDetailsKey(fid: number, appFid: number): string {
  return `onepulse:user:${appFid}:${fid}`;
}

export type UserShareData = {
  username: string;
  displayName: string;
  pfp?: string;
};

function getUserShareDataKey(address: string): string {
  return `onepulse:share:${address.toLowerCase()}`;
}

export async function getUserNotificationDetails(
  fid: number,
  appFid: number
): Promise<MiniAppNotificationDetails | null> {
  return await redis.get<MiniAppNotificationDetails>(
    getUserNotificationDetailsKey(fid, appFid)
  );
}

export async function setUserNotificationDetails(
  fid: number,
  appFid: number,
  notificationDetails: MiniAppNotificationDetails
): Promise<void> {
  await redis.set(
    getUserNotificationDetailsKey(fid, appFid),
    notificationDetails
  );
}

export async function deleteUserNotificationDetails(
  fid: number,
  appFid: number
): Promise<void> {
  await redis.del(getUserNotificationDetailsKey(fid, appFid));
}

export async function setUserShareData(
  address: string,
  data: UserShareData
): Promise<void> {
  await redis.set(getUserShareDataKey(address), data);
}

export async function getUserShareData(
  address: string
): Promise<UserShareData | null> {
  return await redis.get<UserShareData>(getUserShareDataKey(address));
}

export async function getDailyClaimsCount(): Promise<number> {
  const date = new Date().toISOString().split("T")[0];
  const key = `onepulse:daily_claims:${date}`;
  const count = await redis.get<number>(key);
  return count ?? 0;
}

export async function checkAndIncrementDailyClaims(
  limit: number
): Promise<{ allowed: boolean; count: number }> {
  const date = new Date().toISOString().split("T")[0];
  const key = `onepulse:daily_claims:${date}`;
  const count = await redis.incr(key);

  if (count === 1) {
    // Set expiry for 24 hours (plus a bit of buffer) to clean up
    await redis.expire(key, 60 * 60 * 25);
  }

  return { allowed: count <= limit, count };
}
