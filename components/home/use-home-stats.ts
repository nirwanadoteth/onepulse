import { useEffect, useRef } from "react";
import { useGmStats } from "@/hooks/use-gm-stats";
import { hasChanged } from "@/lib/utils";
import type { Chain } from "./chain-config";

export function useHomeStats(
  address: string | undefined,
  chains: Chain[],
  onGmStatsChange?: (stats: ReturnType<typeof useGmStats>) => void
) {
  // Overall GM stats for sharing (keyed by chainId)
  const rawGmStatsResult = useGmStats(address);

  const gmStatsResult = (() => {
    // If no stats, return raw result
    if (!rawGmStatsResult.stats) {
      return rawGmStatsResult;
    }

    // Filter stats to only include chains that are currently displayed/allowed
    const allowedChainIds = new Set(chains.map((c) => String(c.id)));
    const filteredStats: typeof rawGmStatsResult.stats = {};

    for (const [chainId, stat] of Object.entries(rawGmStatsResult.stats)) {
      if (allowedChainIds.has(chainId)) {
        filteredStats[chainId] = stat;
      }
    }

    return {
      ...rawGmStatsResult,
      stats: filteredStats,
    };
  })();

  // Notify parent only when stats actually change (prevents infinite re-render loop)
  const prevStatsRef = useRef<ReturnType<typeof useGmStats> | null>(null);
  const prevOnGmStatsChangeRef = useRef(onGmStatsChange);

  useEffect(() => {
    if (prevOnGmStatsChangeRef.current !== onGmStatsChange) {
      prevStatsRef.current = null;
    }
    prevOnGmStatsChangeRef.current = onGmStatsChange;
    if (!onGmStatsChange) {
      return;
    }
    const prev = prevStatsRef.current;
    const changed =
      !prev ||
      prev.isReady !== gmStatsResult.isReady ||
      hasChanged(prev.stats, gmStatsResult.stats);
    if (!changed) {
      return;
    }
    prevStatsRef.current = gmStatsResult;
    onGmStatsChange(gmStatsResult);
  }, [gmStatsResult, onGmStatsChange]);

  return gmStatsResult;
}
