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
  address: string | null
): GmStats | undefined {
  if (!address || rows.length === 0) {
    return;
  }
  return getKeyedStats(rows);
}

function getChainName(chainId: number): string {
  return SUPPORTED_CHAINS.find((c) => c.id === chainId)?.name || "Unknown";
}

function getKeyedStats(rows: GmStatsByAddress[]): GmStats {
  const result: GmStats = {};
  for (const row of rows) {
    if ((row.allTimeGmCount ?? 0) > 0) {
      result[String(row.chainId)] = {
        name: getChainName(row.chainId),
        currentStreak: row.currentStreak ?? 0,
        highestStreak: row.highestStreak ?? 0,
        allTimeGmCount: row.allTimeGmCount ?? 0,
        lastGmDay: row.lastGmDay ?? 0,
      };
    }
  }
  return result;
}
