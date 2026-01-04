import { useQuery } from "@tanstack/react-query";
import { useEffect, useSyncExternalStore } from "react";
import type { Infer } from "spacetimedb";
import type { GmStatsByAddressV2Row } from "@/lib/module_bindings";
import { gmStatsByAddressStore } from "@/stores/gm-store";
import type { GmStats } from "./use-gm-stats";

type GmStatsByAddress = Infer<typeof GmStatsByAddressV2Row>;

export function useGmStatsSubscription(address?: string | null) {
  useEffect(() => {
    if (!address) {
      return;
    }
    gmStatsByAddressStore.subscribeToAddress(address);
  }, [address]);

  const snapshot = useSyncExternalStore(
    (cb) => gmStatsByAddressStore.subscribe(cb),
    () => gmStatsByAddressStore.getSnapshot(),
    () => gmStatsByAddressStore.getServerSnapshot()
  );
  return snapshot;
}

type GmStatsApiResponse = {
  address: string;
  stats?: Record<
    string,
    {
      name: string;
      currentStreak?: number;
      highestStreak?: number;
      allTimeGmCount?: number;
      lastGmDay?: number;
    }
  >;
};

function parseStatsFromResponse(json: GmStatsApiResponse): GmStats {
  const statsObj = json.stats ?? {};
  const result: GmStats = {};
  for (const [chainId, stats] of Object.entries(statsObj)) {
    result[chainId] = {
      name: stats.name,
      currentStreak: stats.currentStreak ?? 0,
      highestStreak: stats.highestStreak ?? 0,
      allTimeGmCount: stats.allTimeGmCount ?? 0,
      lastGmDay: stats.lastGmDay ?? 0,
    };
  }
  return result;
}

export function useGmStatsFallback(
  rowsForAddress: GmStatsByAddress[],
  address?: string | null
) {
  const normalizedAddress = address?.toLocaleLowerCase() ?? null;

  // Only fetch if subscription data is not ready
  const shouldFetch =
    Boolean(address && normalizedAddress) &&
    !gmStatsByAddressStore.isSubscribedForAddress(normalizedAddress) &&
    rowsForAddress.length === 0;

  const { data: apiResponse } = useQuery({
    queryKey: ["gmStats:fallback", normalizedAddress],
    queryFn: async () => {
      if (!normalizedAddress) {
        throw new Error("Address required");
      }
      const url = new URL("/api/gm/stats", window.location.origin);
      url.searchParams.set("address", normalizedAddress);
      const res = await fetch(url.toString());
      if (!res.ok) {
        throw new Error("Failed to fetch stats");
      }
      return (await res.json()) as GmStatsApiResponse;
    },
    enabled: shouldFetch,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });

  // Listen for refresh events to invalidate the query
  useEffect(() => {
    if (!(address && normalizedAddress)) {
      return;
    }

    const unsubscribe = gmStatsByAddressStore.onRefresh((refreshedAddress) => {
      if (refreshedAddress.toLowerCase() === normalizedAddress) {
        // Refresh is handled by the store, query will stop fetching
      }
    });

    return unsubscribe;
  }, [address, normalizedAddress]);

  if (!apiResponse) {
    return null;
  }

  return {
    key: `${address}:all`,
    stats: parseStatsFromResponse(apiResponse),
  };
}
