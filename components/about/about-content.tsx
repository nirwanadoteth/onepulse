"use client";

export function AboutContent() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-muted-foreground text-sm leading-5">
          OnePulse helps you send a daily on-chain GM, track your streaks across
          multiple networks, and earn rewards.
        </p>
      </div>

      <div className="space-y-2">
        <h2 className="border-b font-semibold text-lg tracking-tight">
          Networks
        </h2>
        <p className="text-sm leading-5">
          OnePulse currently supports the following networks:
        </p>
        <ul className="ml-6 list-disc text-xs [&>li]:mt-1">
          <li>Base</li>
          <li>Celo</li>
          <li>Optimism</li>
        </ul>
      </div>

      <div className="space-y-2">
        <h2 className="border-b font-semibold text-lg tracking-tight">
          Rewards
        </h2>
        <p className="text-sm leading-5">
          Earn rewards per successful daily GM on each supported network.
          Rewards reset daily and are subject to change.
        </p>
      </div>
    </div>
  );
}
