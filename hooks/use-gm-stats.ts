"use client";

import type { Infer } from "spacetimedb";
import type { GmStatsByAddressV2Row } from "@/lib/module_bindings";
import { gmStatsByAddressStore } from "@/stores/gm-store";
import { deriveStatsForAddress, groupRowsByAddress } from "./gm-stats-helpers";
import {
  useGmStatsFallback,
  useGmStatsSubscription,
} from "./use-gm-stats-internal";

type GmStatsByAddress = Infer<typeof GmStatsByAddressV2Row>;

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
  const normalizedAddress = address?.toLocaleLowerCase() ?? null;
  const snapshot = useGmStatsSubscription(normalizedAddress);
  const rowsByAddress = groupRowsByAddress(snapshot);
  const rowsForAddress = (() => {
    if (!normalizedAddress) {
      return EMPTY_ROWS;
    }
    return rowsByAddress.get(normalizedAddress) ?? EMPTY_ROWS;
  })();
  const fallbackStats = useGmStatsFallback(rowsForAddress, normalizedAddress);
  const subDerived = deriveStatsForAddress(rowsForAddress, normalizedAddress);
  const currentKey = `${normalizedAddress ?? ""}:all`;
  const fallbackForKey =
    fallbackStats && fallbackStats.key === currentKey
      ? fallbackStats.stats
      : undefined;
  const stats: GmStats = subDerived ?? fallbackForKey ?? ZERO;
  const isReady =
    gmStatsByAddressStore.isSubscribedForAddress(address) ||
    Boolean(fallbackForKey);

  return { stats, isReady };
}
