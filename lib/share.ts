import type { GmStats } from "@/hooks/use-gm-stats";

export function shouldShowShareButton(gmStats: GmStats | undefined) {
  if (!gmStats) {
    return false;
  }
  return Object.values(gmStats).some(
    (stats) => stats.allTimeGmCount > 0 || stats.currentStreak > 0
  );
}
