"use server";

import {
  Configuration,
  isApiErrorResponse,
  NeynarAPIClient,
} from "@neynar/nodejs-sdk";
import { handleError } from "@/lib/error-handling";
import { getCachedNeynarScore, setCachedNeynarScore } from "./kv";

type ScoreResponse = {
  users: {
    fid: number;
    score: number;
  }[];
};

const client = new NeynarAPIClient(
  new Configuration({ apiKey: process.env.NEYNAR_API_KEY || "" })
);

export async function getScore(fids: number[]): Promise<ScoreResponse> {
  const normalizedFids = [...new Set(fids)].sort((a, b) => a - b);
  if (normalizedFids.length === 0) {
    return { users: [] };
  }
  // Check cache first
  try {
    const cached = await getCachedNeynarScore(normalizedFids);
    if (cached) {
      return cached;
    }
  } catch (error) {
    handleError(
      error,
      "Error accessing Neynar score cache",
      {
        operation: "neynar/cache-access",
      },
      { silent: true }
    );
  }

  // Fetch from Neynar API
  try {
    const response = await client.fetchBulkUsers({ fids: normalizedFids });
    const result = {
      users: response.users.map((user) => ({
        fid: user.fid || 0,
        score: user.score || 0,
      })),
    };

    // Cache the result
    try {
      await setCachedNeynarScore(normalizedFids, result);
    } catch (error) {
      handleError(
        error,
        "Error setting Neynar score cache",
        {
          operation: "neynar/cache-set",
        },
        { silent: true }
      );
    }

    return result;
  } catch (error) {
    if (isApiErrorResponse(error)) {
      handleError(
        error.response.data,
        "Neynar API error",
        {
          operation: "neynar/getScore",
        },
        { silent: true }
      );
    } else {
      handleError(
        error,
        "Error fetching Neynar user",
        {
          operation: "neynar/getScore",
        },
        { silent: true }
      );
    }
    return { users: [] };
  }
}
