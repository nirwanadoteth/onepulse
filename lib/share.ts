import type { GmStats } from "@/hooks/use-gm-stats";

export function shouldShowShareButton(gmStats: GmStats | undefined) {
  return !!gmStats && (gmStats.allTimeGmCount > 0 || gmStats.currentStreak > 0);
}
