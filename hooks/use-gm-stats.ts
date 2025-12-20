"use client";

import { useMemo } from "react";
import type { Infer } from "spacetimedb";
import type GmStatsByAddressSchema from "@/lib/module_bindings/gm_stats_by_address_table";
import { normalizeAddress } from "@/lib/utils";
import { gmStatsByAddressStore } from "@/stores/gm-store";
import { deriveStatsForAddress, groupRowsByAddress } from "./gm-stats-helpers";
import {
  useGmStatsFallback,
  useGmStatsSubscription,
} from "./use-gm-stats-internal";

type GmStatsByAddress = Infer<typeof GmStatsByAddressSchema>;

export type GmStats = Record<
  string,
  {
    name: string;
    currentStreak: number;
    highestStreak: number;
    allTimeGmCount: number;
    lastGmDay: number;
  }
>;

export const ZERO: GmStats = {};

export const EMPTY_ROWS: GmStatsByAddress[] = [];

export type GmStatsResult = {
  stats: GmStats;
  isReady: boolean;
};

export function useGmStats(address?: string | null): GmStatsResult {
  const normalizedAddress = normalizeAddress(address);
  const snapshot = useGmStatsSubscription(address);
  const rowsByAddress = useMemo(() => groupRowsByAddress(snapshot), [snapshot]);
  const rowsForAddress = useMemo(() => {
    if (!normalizedAddress) {
      return EMPTY_ROWS;
    }
    return rowsByAddress.get(normalizedAddress) ?? EMPTY_ROWS;
  }, [normalizedAddress, rowsByAddress]);
  const fallbackStats = useGmStatsFallback(rowsForAddress, address);
  const subDerived = useMemo(
    () => deriveStatsForAddress(rowsForAddress, normalizedAddress),
    [rowsForAddress, normalizedAddress]
  );
  const currentKey = `${address ?? ""}:all`;
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
