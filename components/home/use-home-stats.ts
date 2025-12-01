import { useEffect, useMemo, useRef } from "react";
import { useGmStats } from "@/hooks/use-gm-stats";
import { hasChanged } from "@/lib/utils";
import type { Chain } from "./chain-config";

export function useHomeStats(
  address: string | undefined,
  chains: Chain[],
  onGmStatsChange?: (stats: ReturnType<typeof useGmStats>) => void
) {
  // Overall GM stats for sharing (aggregate across chains)
  const rawGmStatsResult = useGmStats(address);

  const gmStatsResult = useMemo(() => {
    // If no stats, return raw result
    if (!rawGmStatsResult.stats) {
      return rawGmStatsResult;
    }

    // Filter chains based on what's currently displayed/allowed
    const allowedNames = chains.map((c) => c.name);

    return {
      ...rawGmStatsResult,
      stats: {
        ...rawGmStatsResult.stats,
        chains: rawGmStatsResult.stats.chains.filter((c) =>
          allowedNames.includes(c.name)
        ),
      },
    };
  }, [rawGmStatsResult, chains]);

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
