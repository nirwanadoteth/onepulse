"use client";

import { useMemo } from "react";
import type { GmStatsByAddress } from "@/lib/module_bindings";
import { normalizeAddress } from "@/lib/utils";
import { gmStatsByAddressStore } from "@/stores/gm-store";
import { deriveStatsForAddress, groupRowsByAddress } from "./gm-stats-helpers";
import {
  useGmStatsFallback,
  useGmStatsSubscription,
} from "./use-gm-stats-internal";

export type GmStats = {
  currentStreak: number;
  highestStreak: number;
  allTimeGmCount: number;
  lastGmDay: number;
};

export const ZERO: GmStats = {
  currentStreak: 0,
  highestStreak: 0,
  allTimeGmCount: 0,
  lastGmDay: 0,
};

export const EMPTY_ROWS: GmStatsByAddress[] = [];

export type GmStatsResult = {
  stats: GmStats;
  isReady: boolean;
};

export function useGmStats(
  address?: string | null,
  chainId?: number
): GmStatsResult {
  const normalizedAddress = normalizeAddress(address);
  const snapshot = useGmStatsSubscription(address);
  const rowsByAddress = useMemo(() => groupRowsByAddress(snapshot), [snapshot]);
  const rowsForAddress = useMemo(() => {
    if (!normalizedAddress) {
      return EMPTY_ROWS;
    }
    return rowsByAddress.get(normalizedAddress) ?? EMPTY_ROWS;
  }, [normalizedAddress, rowsByAddress]);
  const fallbackStats = useGmStatsFallback(rowsForAddress, address, chainId);
  const subDerived = useMemo(
    () =>
      deriveStatsForAddress(rowsForAddress, normalizedAddress, ZERO, chainId),
    [rowsForAddress, normalizedAddress, chainId]
  );
  const currentKey = `${address ?? ""}:${chainId ?? "all"}`;
  const fallbackForKey =
    fallbackStats && fallbackStats.key === currentKey
      ? fallbackStats.stats
      : undefined;
  const stats: GmStats = subDerived ?? fallbackForKey ?? ZERO;
  const isReady =
    gmStatsByAddressStore.isSubscribedForAddress(address) ||
    Boolean(fallbackForKey);

  return useMemo(() => ({ stats, isReady }), [stats, isReady]);
}
