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
  stats: GmStats | undefined;
  chainId: number;
  isConnected: boolean;
  isStatsReady: boolean;
};

export const StatsDisplay = memo(
  ({ stats, chainId, isConnected, isStatsReady }: StatsDisplayProps) => {
    const chainStats =
      isConnected && stats ? stats[String(chainId)] : undefined;

    const getValue = (statValue: number | undefined) => {
      if (!isConnected) {
        return 0;
      }
      if (!isStatsReady) {
        return;
      }
      if (!chainStats) {
        return 0;
      }
      return statValue;
    };

    return (
      <div className="grid grid-cols-3 gap-2 text-center">
        <StatColumn
          label="Current"
          value={getValue(chainStats?.currentStreak)}
        />
        <StatColumn
          label="Highest"
          value={getValue(chainStats?.highestStreak)}
        />
        <StatColumn
          label="All-Time"
          value={getValue(chainStats?.allTimeGmCount)}
        />
      </div>
    );
  }
);
