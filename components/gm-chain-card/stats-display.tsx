import { Spinner } from "@/components/ui/spinner";
import { useGmStats } from "@/hooks/use-gm-stats";

type StatColumnProps = {
  value: number;
  label: string;
};

function StatColumn({ value, label }: StatColumnProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="font-bold text-xl tracking-tight">
        {value !== undefined ? value : <Spinner className="inline h-4 w-4" />}
      </span>
      <span className="font-medium text-muted-foreground text-xs">{label}</span>
    </div>
  );
}

type StatsDisplayProps = {
  address: string | undefined;
  isConnected: boolean;
};

export function StatsDisplay({ address, isConnected }: StatsDisplayProps) {
  const { stats, isReady } = useGmStats(address);

  const getValue = (statValue: number) => {
    return isConnected && isReady ? statValue : 0;
  };

  return (
    <div className="grid grid-cols-3 gap-2 text-center" key={address}>
      <StatColumn label="Current" value={getValue(stats.currentStreak)} />
      <StatColumn label="Highest" value={getValue(stats.highestStreak)} />
      <StatColumn label="All-Time" value={getValue(stats.allTimeGmCount)} />
    </div>
  );
}
