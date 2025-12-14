import { z } from "zod";
import { handleError } from "@/lib/error-handling";
import {
  type CachedFarcasterUser,
  getCachedFarcasterUser,
  setCachedFarcasterUser,
} from "./kv";

export type FarcasterUser = {
  fid: number;
  username: string;
  displayName: string;
  pfp: {
    url: string;
    verified: boolean;
  };
};

export type FarcasterUserResponse = {
  result: {
    user: FarcasterUser;
  };
};

const farcasterUserSchema = z.object({
  fid: z.number(),
  username: z.string(),
  displayName: z.string(),
  pfp: z
    .object({
      url: z.string(),
      verified: z.boolean(),
    })
    .optional(),
});

const farcasterUserResponseSchema = z.object({
  result: z.object({
    user: farcasterUserSchema,
  }),
});

export async function fetchFarcasterUser(
  fid: number
): Promise<FarcasterUser | null> {
  // Check cache first
  const cached = await getCachedFarcasterUser(fid);
  if (cached) {
    return {
      fid: cached.fid,
      username: cached.username,
      displayName: cached.displayName,
      pfp: {
        url: cached.pfpUrl || "",
        verified: cached.pfpVerified ?? false,
      },
    };
  }

  try {
    const response = await fetch(
      `https://api.farcaster.xyz/v2/user?fid=${fid}`,
      { cache: "no-store" }
    );
    if (!response.ok) {
      return null;
    }
    const json = await response.json();
    const data = farcasterUserResponseSchema.parse(json);
    const user = data.result.user;

    // Cache the result
    const cacheData: CachedFarcasterUser = {
      fid: user.fid,
      username: user.username,
      displayName: user.displayName,
      pfpUrl: user.pfp?.url || null,
      pfpVerified: user.pfp?.verified ?? false,
    };
    await setCachedFarcasterUser(fid, cacheData);

    return {
      ...user,
      pfp: user.pfp ?? { url: "", verified: false },
    };
  } catch (error) {
    handleError(
      error,
      "Failed to fetch Farcaster user",
      {
        operation: "farcaster/fetch-user",
        fid,
      },
      { silent: true }
    );
    return null;
  }
}
