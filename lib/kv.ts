import type { MiniAppNotificationDetails } from "@farcaster/miniapp-sdk";
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

export async function setUserShareData(
  address: string,
  data: UserShareData
): Promise<void> {
  try {
    await redis.set(getUserShareDataKey(address), data);
  } catch (error) {
    reportKvError(error, "setUserShareData", { address });
    throw error;
  }
}

export async function getUserShareData(
  address: string
): Promise<UserShareData | null> {
  try {
    return await redis.get<UserShareData>(getUserShareDataKey(address));
  } catch (error) {
    reportKvError(error, "getUserShareData", { address });
    throw error;
  }
}

// Cache TTLs in seconds
const FARCASTER_USER_CACHE_TTL = 300; // 5 minutes
const NEYNAR_SCORE_CACHE_TTL = 3600; // 1 hour
const GOOGLE_FONT_CACHE_TTL = 86_400; // 24 hours

function getFarcasterUserCacheKey(fid: number): string {
  return `onepulse:cache:farcaster_user:${fid}`;
}

function getNeynarScoreCacheKey(fids: number[]): string {
  const sortedFids = [...fids].sort((a, b) => a - b);
  return `onepulse:cache:neynar_score:${sortedFids.join(",")}`;
}

function getGoogleFontCacheKey(font: string, weight: number): string {
  return `onepulse:cache:font:${font}:${weight}`;
}

export type CachedFarcasterUser = {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string | null;
  pfpVerified: boolean;
};

export async function getCachedFarcasterUser(
  fid: number
): Promise<CachedFarcasterUser | null> {
  try {
    return await redis.get<CachedFarcasterUser>(getFarcasterUserCacheKey(fid));
  } catch (error) {
    reportKvError(error, "getCachedFarcasterUser", { fid });
    return null;
  }
}

export async function setCachedFarcasterUser(
  fid: number,
  user: CachedFarcasterUser
): Promise<void> {
  try {
    await redis.set(getFarcasterUserCacheKey(fid), user, {
      ex: FARCASTER_USER_CACHE_TTL,
    });
  } catch (error) {
    reportKvError(error, "setCachedFarcasterUser", { fid });
  }
}

export type CachedNeynarScore = {
  users: { fid: number; score: number }[];
};

export async function getCachedNeynarScore(
  fids: number[]
): Promise<CachedNeynarScore | null> {
  try {
    return await redis.get<CachedNeynarScore>(getNeynarScoreCacheKey(fids));
  } catch (error) {
    reportKvError(error, "getCachedNeynarScore", { fids });
    return null;
  }
}

export async function setCachedNeynarScore(
  fids: number[],
  data: CachedNeynarScore
): Promise<void> {
  try {
    await redis.set(getNeynarScoreCacheKey(fids), data, {
      ex: NEYNAR_SCORE_CACHE_TTL,
    });
  } catch (error) {
    reportKvError(error, "setCachedNeynarScore", { fids });
  }
}

export async function getCachedGoogleFont(
  font: string,
  weight: number
): Promise<string | null> {
  try {
    // Store as base64 string since Redis can't store ArrayBuffer
    return await redis.get<string>(getGoogleFontCacheKey(font, weight));
  } catch (error) {
    reportKvError(error, "getCachedGoogleFont", { font, weight });
    return null;
  }
}

export async function setCachedGoogleFont(
  font: string,
  weight: number,
  fontDataBase64: string
): Promise<void> {
  try {
    await redis.set(getGoogleFontCacheKey(font, weight), fontDataBase64, {
      ex: GOOGLE_FONT_CACHE_TTL,
    });
  } catch (error) {
    reportKvError(error, "setCachedGoogleFont", { font, weight });
  }
}

export async function checkRateLimit(
  identifier: string,
  limit = 10,
  windowSeconds = 60
): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const key = `onepulse:ratelimit:${identifier}`;
    const count = await redis.incr(key);

    if (count === 1) {
      await redis.expire(key, windowSeconds);
    }

    return { allowed: count <= limit, remaining: Math.max(0, limit - count) };
  } catch (error) {
    reportKvError(error, "checkRateLimit", {
      identifier,
      limit,
      windowSeconds,
    });
    throw error;
  }
}

// Hidden Chains Management
const HIDDEN_CHAINS_KEY = "onepulse:config:hidden_chains";

export async function getHiddenChains(): Promise<number[]> {
  try {
    const hidden = await redis.get<number[]>(HIDDEN_CHAINS_KEY);
    return hidden || [];
  } catch (error) {
    reportKvError(error, "getHiddenChains", {});
    return [];
  }
}

export async function setHiddenChains(chainIds: number[]): Promise<void> {
  try {
    await redis.set(HIDDEN_CHAINS_KEY, chainIds);
  } catch (error) {
    reportKvError(error, "setHiddenChains", { chainIds });
    throw error;
  }
}

export async function toggleChainVisibility(chainId: number): Promise<{
  hidden: boolean;
  allHiddenChains: number[];
}> {
  try {
    const currentHidden = await getHiddenChains();
    const isCurrentlyHidden = currentHidden.includes(chainId);

    let newHidden: number[];
    if (isCurrentlyHidden) {
      // Unhide the chain
      newHidden = currentHidden.filter((id) => id !== chainId);
    } else {
      // Hide the chain
      newHidden = [...currentHidden, chainId];
    }

    await setHiddenChains(newHidden);

    return {
      hidden: !isCurrentlyHidden,
      allHiddenChains: newHidden,
    };
  } catch (error) {
    reportKvError(error, "toggleChainVisibility", { chainId });
    throw error;
  }
}
