"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function HowItWorksCard() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="font-semibold text-lg">How It Works</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-3 text-sm">
          <span className="font-light text-muted-foreground">1.</span>
          <div className="space-y-1">
            <h4 className="font-medium">Send GM on Base</h4>
            <p className="text-muted-foreground text-xs">
              Send GM on Base to qualify for rewards
            </p>
          </div>
        </div>

        <div className="flex gap-3 text-sm">
          <span className="font-light text-muted-foreground">2.</span>
          <div className="space-y-1">
            <h4 className="font-medium">Claim Reward</h4>
            <p className="text-muted-foreground text-xs">
              Claim 10 DEGEN tokens once per day
            </p>
          </div>
        </div>

        <div className="flex gap-3 text-sm">
          <span className="font-light text-muted-foreground">3.</span>
          <div className="space-y-1">
            <h4 className="font-medium">Repeat</h4>
            <p className="text-muted-foreground text-xs">
              Rewards reset on daily basis
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
