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

const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000; // milliseconds

/**
 * Helper to retry a function with exponential backoff.
 * Only retries on transient errors (network errors, HTTP 5xx, 429).
 * Does not retry on other 4xx errors.
 */
async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = INITIAL_DELAY
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    // Check if error is retryable
    const isRetryable = isRetryableError(error);

    if (retries > 0 && isRetryable) {
      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
      // Retry with doubled delay
      return fetchWithRetry(fn, retries - 1, delay * 2);
    }

    // No more retries or non-retryable error
    throw error;
  }
}

/**
 * Determines if an error is transient and should be retried.
 * Retries: network errors, HTTP 5xx, 429 (rate limit)
 * Does not retry: other 4xx errors
 */
function isRetryableError(error: unknown): boolean {
  // Network/timeout errors
  if (
    error instanceof Error &&
    (error.message.includes("ECONNREFUSED") ||
      error.message.includes("ETIMEDOUT") ||
      error.message.includes("ENOTFOUND") ||
      error.message.includes("timeout"))
  ) {
    return true;
  }

  // Check for Neynar API error response
  if (isApiErrorResponse(error)) {
    const status = error.response?.status;
    // Retry on 5xx and 429 (rate limit)
    if (status && (status >= 500 || status === 429)) {
      return true;
    }
    // Do not retry other 4xx errors
    return false;
  }

  // Default to not retrying unknown errors
  return false;
}

export async function getScore(fids: number[]): Promise<ScoreResponse> {
  const normalizedFids = [...new Set(fids.filter((fid) => fid > 0))].sort(
    (a, b) => a - b
  );
  if (normalizedFids.length === 0) {
    return { users: [] };
  }
  // Check cache first (errors handled silently inside getCachedNeynarScore)
  const cached = await getCachedNeynarScore(normalizedFids);
  if (cached) {
    return cached;
  }

  // Fetch from Neynar API with exponential backoff retry
  try {
    const response = await fetchWithRetry(() =>
      client.fetchBulkUsers({ fids: normalizedFids })
    );
    const result = {
      users: response.users.map((user) => ({
        fid: user.fid || 0,
        score: user.score || 0,
      })),
    };

    // Cache the result (errors handled silently inside setCachedNeynarScore)
    await setCachedNeynarScore(normalizedFids, result);

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
