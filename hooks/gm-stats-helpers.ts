import type { GmStatsByAddress } from "@/lib/module_bindings";
import { normalizeAddress as normalizeAddressUtil } from "@/lib/utils";

import type { GmStats } from "./use-gm-stats";

export function normalizeAddress(address?: string | null): string | null {
  return normalizeAddressUtil(address);
}

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
    const row = rows.find((r) => r.chainId === chainId);
    return row
      ? {
          currentStreak: row.currentStreak ?? 0,
          highestStreak: row.highestStreak ?? 0,
          allTimeGmCount: row.allTimeGmCount ?? 0,
          lastGmDay: row.lastGmDay ?? 0,
        }
      : undefined;
  }
  return rows.reduce<GmStats>(
    (acc, r) => ({
      currentStreak: Math.max(acc.currentStreak, r.currentStreak ?? 0),
      highestStreak: Math.max(acc.highestStreak, r.highestStreak ?? 0),
      allTimeGmCount: acc.allTimeGmCount + (r.allTimeGmCount ?? 0),
      lastGmDay: Math.max(acc.lastGmDay, r.lastGmDay ?? 0),
    }),
    { ...zero }
  );
}
