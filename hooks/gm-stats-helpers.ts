import type { Infer } from "spacetimedb";
import { SUPPORTED_CHAINS } from "@/lib/constants";
import type GmStatsByAddressSchema from "@/lib/module_bindings/gm_stats_by_address_table";

import type { GmStats } from "./use-gm-stats";

type GmStatsByAddress = Infer<typeof GmStatsByAddressSchema>;

export function groupRowsByAddress(
  rows: GmStatsByAddress[]
): Map<string, GmStatsByAddress[]> {
  const map = new Map<string, GmStatsByAddress[]>();
  for (const row of rows) {
    const key = row.address.toLowerCase();
    const existing = map.get(key);
    if (existing) {
      existing.push(row);
    } else {
      map.set(key, [row]);
    }
  }
  return map;
}

export function deriveStatsForAddress(
  rows: GmStatsByAddress[],
  address: string | null,
  zero: GmStats,
  chainId?: number
): GmStats | undefined {
  if (!address || rows.length === 0) {
    return;
  }
  if (typeof chainId === "number") {
    return getStatsForSingleChain(rows, chainId);
  }
  return getAggregateStats(rows, zero);
}

function getChainName(chainId: number): string {
  return SUPPORTED_CHAINS.find((c) => c.id === chainId)?.name || "Unknown";
}

function getStatsForSingleChain(
  rows: GmStatsByAddress[],
  chainId: number
): GmStats | undefined {
  const row = rows.find((r) => r.chainId === chainId);
  if (!row) {
    return;
  }

  const count = row.allTimeGmCount ?? 0;
  return {
    currentStreak: row.currentStreak ?? 0,
    highestStreak: row.highestStreak ?? 0,
    allTimeGmCount: count,
    lastGmDay: row.lastGmDay ?? 0,
    chains: [{ name: getChainName(row.chainId), count }],
  };
}

function getAggregateStats(rows: GmStatsByAddress[], zero: GmStats): GmStats {
  const stats = rows.reduce<GmStats>((acc, r) => {
    const count = r.allTimeGmCount ?? 0;
    return {
      currentStreak: Math.max(acc.currentStreak, r.currentStreak ?? 0),
      highestStreak: Math.max(acc.highestStreak, r.highestStreak ?? 0),
      allTimeGmCount: acc.allTimeGmCount + count,
      lastGmDay: Math.max(acc.lastGmDay, r.lastGmDay ?? 0),
      chains: [], // We'll populate this after
    };
  }, zero);

  // Populate chains array dynamically
  stats.chains = SUPPORTED_CHAINS.map((chain) => ({
    name: chain.name,
    count: rows.find((r) => r.chainId === chain.id)?.allTimeGmCount ?? 0,
  })).filter((c) => c.count > 0);

  return stats;
}
