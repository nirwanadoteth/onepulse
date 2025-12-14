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
  // Check cache first
  const cached = await getCachedNeynarScore(fids);
  if (cached) {
    return cached;
  }

  try {
    const response = await client.fetchBulkUsers({ fids });
    const result = {
      users: response.users.map((user) => ({
        fid: user.fid || 0,
        score: user.score || 0,
      })),
    };

    // Cache the result
    await setCachedNeynarScore(fids, result);

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
