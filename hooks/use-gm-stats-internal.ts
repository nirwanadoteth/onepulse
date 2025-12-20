import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { Infer } from "spacetimedb";
import type GmStatsByAddressSchema from "@/lib/module_bindings/gm_stats_by_address_table";
import { normalizeAddress } from "@/lib/utils";
import { gmStatsByAddressStore } from "@/stores/gm-store";
import type { GmStats } from "./use-gm-stats";

type GmStatsByAddress = Infer<typeof GmStatsByAddressSchema>;

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
  const [_fallbackStats, setFallbackStats] = useState<
    | {
        key: string;
        stats: GmStats;
      }
    | undefined
  >();
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const normalizedAddress = normalizeAddress(address);

  useEffect(() => {
    if (!(address && normalizedAddress)) {
      return;
    }

    const unsubscribe = gmStatsByAddressStore.onRefresh((refreshedAddress) => {
      if (refreshedAddress.toLowerCase() === normalizedAddress) {
        setFallbackStats(undefined);
        setLastFetchTime(0);
      }
    });

    return unsubscribe;
  }, [address, normalizedAddress]);

  const checkHasSubscriptionData = useCallback(
    (rows: typeof rowsForAddress) => rows.length > 0,
    []
  );

  const cleanupTimeoutAndAbort = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    abortControllerRef.current?.abort();
  }, []);

  const shouldSkipFetch = useCallback(
    (latestRows: typeof rowsForAddress) => {
      if (!address) {
        return true;
      }
      const latestReady = gmStatsByAddressStore.isSubscribedForAddress(address);
      const latestHasData = checkHasSubscriptionData(latestRows);

      if (latestReady && latestHasData) {
        return true;
      }

      const now = Date.now();
      return now - lastFetchTime < 2000;
    },
    [address, checkHasSubscriptionData, lastFetchTime]
  );

  const buildStatsUrl = useCallback(() => {
    if (!address) {
      throw new Error("Address is required for stats URL");
    }
    const url = new URL("/api/gm/stats", window.location.origin);
    url.searchParams.set("address", address);
    return url.toString();
  }, [address]);

  const fetchFallbackStats = useCallback(
    async (key: string) => {
      try {
        const latestRows = gmStatsByAddressStore
          .getSnapshot()
          .filter((r) => r.address.toLowerCase() === normalizedAddress);

        if (shouldSkipFetch(latestRows)) {
          return;
        }

        const res = await fetch(buildStatsUrl(), {
          signal: abortControllerRef.current?.signal,
        });

        if (res.ok) {
          const json = (await res.json()) as GmStatsApiResponse;
          setLastFetchTime(Date.now());
          setFallbackStats({
            key,
            stats: parseStatsFromResponse(json),
          });
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        // Ignore other errors for fallback
      }
    },
    [normalizedAddress, shouldSkipFetch, buildStatsUrl]
  );

  useEffect(() => {
    if (!(address && normalizedAddress)) {
      return;
    }
    const key = `${address}:all`;
    const subReady = gmStatsByAddressStore.isSubscribedForAddress(address);
    const hasSubData = checkHasSubscriptionData(rowsForAddress);

    if (subReady && hasSubData) {
      cleanupTimeoutAndAbort();
      return;
    }

    cleanupTimeoutAndAbort();
    abortControllerRef.current = new AbortController();

    timeoutRef.current = setTimeout(() => fetchFallbackStats(key), 500);

    return () => cleanupTimeoutAndAbort();
  }, [
    address,
    normalizedAddress,
    rowsForAddress,
    checkHasSubscriptionData,
    cleanupTimeoutAndAbort,
    fetchFallbackStats,
  ]);

  return _fallbackStats;
}
