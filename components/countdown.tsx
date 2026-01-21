import { ClockIcon } from "lucide-react";
import { useCountdown } from "@/hooks/use-countdown";

/**
 * Countdown component that displays time until the next GM reset
 * Shows a live countdown in HH:MM:SS format
 * Uses a pill-shaped design with hover effects
 *
 * @returns The rendered countdown component
 */
export function Countdown() {
  const { text } = useCountdown();

  return (
    <div className="group mx-auto flex w-fit items-center gap-2.5 rounded-full border border-border/60 bg-linear-to-b from-muted/40 to-muted/60 px-4 py-2.5 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-border hover:shadow-md">
      <div className="flex items-center gap-2">
        <ClockIcon className="size-3.5" aria-hidden="true" />
        <span className="align-middle font-medium text-muted-foreground text-xs">
          Next reset in
        </span>
        <span className="font-mono font-semibold text-xs tabular-nums tracking-tight" aria-live="polite" aria-label={`Time until next reset: ${text}`}>
          {text}
        </span>
      </div>
    </div>
  );
}
