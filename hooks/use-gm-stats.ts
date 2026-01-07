"use client";

import { eq, useSpacetimeDB, useTable, where } from "spacetimedb/react";
import { tables } from "@/spacetimedb";

export type GmStats = {
  currentStreak: number;
  highestStreak: number;
  allTimeGmCount: number;
};

export const ZERO: GmStats = {
  currentStreak: 0,
  highestStreak: 0,
  allTimeGmCount: 0,
};

export type GmStatsResult = {
  stats: GmStats;
  isReady: boolean;
};

export function useGmStats(address?: string): GmStatsResult {
  const normalizedAddress = address ?? "";
  const { identity, isActive: connected } = useSpacetimeDB();
  const [gmStats] = useTable(
    tables.stats,
    where(eq("address", normalizedAddress))
  );

  if (!(connected && identity)) {
    return { stats: ZERO, isReady: false };
  }

  // Return ZERO stats with isReady=false if no address
  if (!address) {
    return { stats: ZERO, isReady: false };
  }

  // Verify the result matches the queried address to avoid stale data
  if (!gmStats[0] || gmStats[0].address !== normalizedAddress) {
    return { stats: ZERO, isReady: false };
  }

  const stats = {
    currentStreak: gmStats[0].currentStreak,
    highestStreak: gmStats[0].highestStreak,
    allTimeGmCount: gmStats[0].allTimeGmCount,
  };
  return { stats, isReady: true };
}
