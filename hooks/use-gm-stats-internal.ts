import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { normalizeAddress } from "@/lib/utils";
import { gmStatsByAddressStore } from "@/stores/gm-store";
import type { GmStats } from "./use-gm-stats";

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

export function useGmStatsFallback(
  rowsForAddress: import("@/lib/module_bindings").GmStatsByAddress[],
  address?: string | null,
  chainId?: number
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
    (rows: typeof rowsForAddress, chainIdParam?: number) =>
      typeof chainIdParam === "number"
        ? rows.some((r) => r.chainId === chainIdParam)
        : rows.length > 0,
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
      const latestHasData = checkHasSubscriptionData(latestRows, chainId);

      if (latestReady && latestHasData) {
        return true;
      }

      const now = Date.now();
      return now - lastFetchTime < 2000;
    },
    [address, chainId, checkHasSubscriptionData, lastFetchTime]
  );

  const buildStatsUrl = useCallback(() => {
    if (!address) {
      throw new Error("Address is required for stats URL");
    }
    const url = new URL("/api/gm/stats", window.location.origin);
    url.searchParams.set("address", address);
    if (typeof chainId === "number") {
      url.searchParams.set("chainId", String(chainId));
    }
    return url.toString();
  }, [address, chainId]);

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
          const json = (await res.json()) as Partial<GmStats>;
          setLastFetchTime(Date.now());
          setFallbackStats({
            key,
            stats: {
              currentStreak: json.currentStreak ?? 0,
              highestStreak: json.highestStreak ?? 0,
              allTimeGmCount: json.allTimeGmCount ?? 0,
              lastGmDay: json.lastGmDay ?? 0,
            },
          });
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        // Fallback fetch failure handled silently
      }
    },
    [normalizedAddress, shouldSkipFetch, buildStatsUrl]
  );

  useEffect(() => {
    if (!(address && normalizedAddress)) {
      return;
    }
    const key = `${address}:${chainId ?? "all"}`;
    const subReady = gmStatsByAddressStore.isSubscribedForAddress(address);
    const hasSubData = checkHasSubscriptionData(rowsForAddress, chainId);

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
    chainId,
    normalizedAddress,
    rowsForAddress,
    checkHasSubscriptionData,
    cleanupTimeoutAndAbort,
    fetchFallbackStats,
  ]);

  return _fallbackStats;
}
