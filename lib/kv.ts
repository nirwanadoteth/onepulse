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

// Cache TTLs in seconds
const FARCASTER_USER_CACHE_TTL = 300; // 5 minutes
const NEYNAR_SCORE_CACHE_TTL = 3600; // 1 hour
const GOOGLE_FONT_CACHE_TTL = 86_400; // 24 hours

function getFarcasterUserCacheKey(fid: number): string {
  return `onepulse:cache:farcaster_user:${fid}`;
}

function getNeynarScoreCacheKey(fids: number[]): string {
  return `onepulse:cache:neynar_score:${fids.sort().join(",")}`;
}

function getGoogleFontCacheKey(font: string, weight: number): string {
  return `onepulse:cache:font:${font}:${weight}`;
}

export type CachedFarcasterUser = {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string | null;
};

export async function getCachedFarcasterUser(
  fid: number
): Promise<CachedFarcasterUser | null> {
  return await redis.get<CachedFarcasterUser>(getFarcasterUserCacheKey(fid));
}

export async function setCachedFarcasterUser(
  fid: number,
  user: CachedFarcasterUser
): Promise<void> {
  await redis.set(getFarcasterUserCacheKey(fid), user, {
    ex: FARCASTER_USER_CACHE_TTL,
  });
}

export type CachedNeynarScore = {
  users: { fid: number; score: number }[];
};

export async function getCachedNeynarScore(
  fids: number[]
): Promise<CachedNeynarScore | null> {
  return await redis.get<CachedNeynarScore>(getNeynarScoreCacheKey(fids));
}

export async function setCachedNeynarScore(
  fids: number[],
  data: CachedNeynarScore
): Promise<void> {
  await redis.set(getNeynarScoreCacheKey(fids), data, {
    ex: NEYNAR_SCORE_CACHE_TTL,
  });
}

export async function getCachedGoogleFont(
  font: string,
  weight: number
): Promise<string | null> {
  // Store as base64 string since Redis can't store ArrayBuffer
  return await redis.get<string>(getGoogleFontCacheKey(font, weight));
}

export async function setCachedGoogleFont(
  font: string,
  weight: number,
  fontDataBase64: string
): Promise<void> {
  await redis.set(getGoogleFontCacheKey(font, weight), fontDataBase64, {
    ex: GOOGLE_FONT_CACHE_TTL,
  });
}

export async function checkRateLimit(
  identifier: string,
  limit = 10,
  windowSeconds = 60
): Promise<{ allowed: boolean; remaining: number }> {
  const key = `onepulse:ratelimit:${identifier}`;
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, windowSeconds);
  }

  return { allowed: count <= limit, remaining: Math.max(0, limit - count) };
}

export async function markTransactionAsProcessed(
  txHash: string
): Promise<boolean> {
  const key = `onepulse:processed_tx:${txHash.toLowerCase()}`;
  // Set if not exists (nx: true), expire in 24h (ex: 86400)
  const result = await redis.set(key, "1", { nx: true, ex: 86_400 });
  return result === "OK";
}
