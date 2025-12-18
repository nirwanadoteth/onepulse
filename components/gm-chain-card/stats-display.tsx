import { memo } from "react";
import { Spinner } from "@/components/ui/spinner";
import type { GmStats } from "@/hooks/use-gm-stats";

type StatColumnProps = {
  value: number | undefined;
  label: string;
};

const StatColumn = memo(({ value, label }: StatColumnProps) => (
  <div className="flex flex-col items-center gap-1">
    <span className="font-bold text-xl tracking-tight">
      {value !== undefined ? value : <Spinner className="inline h-4 w-4" />}
    </span>
    <span className="font-medium text-muted-foreground text-xs">{label}</span>
  </div>
));

type StatsDisplayProps = {
  stats: GmStats;
  isConnected: boolean;
  isStatsReady: boolean;
};

export const StatsDisplay = memo(
  ({ stats, isConnected, isStatsReady }: StatsDisplayProps) => {
    if (!(isConnected && stats)) {
      return (
        <div className="text-muted-foreground text-xs">
          Connect wallet to see stats
        </div>
      );
    }

    return (
      <div className="grid grid-cols-3 gap-2 text-center">
        <StatColumn
          label="Current"
          value={isStatsReady ? stats.currentStreak : undefined}
        />
        <StatColumn
          label="Highest"
          value={isStatsReady ? stats.highestStreak : undefined}
        />
        <StatColumn
          label="All-Time"
          value={isStatsReady ? stats.allTimeGmCount : undefined}
        />
      </div>
    );
  }
);
