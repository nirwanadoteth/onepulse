"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

export function MiniAppRequiredCard() {
  const handleOpenInApp = () => {
    const appUrl = window.location.href;
    // Try to open in Warpcast (Farcaster) or Base app
    window.open(
      `https://farcaster.xyz/?launchFrameUrl=${encodeURIComponent(appUrl)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <Card className="border-border/50">
      <CardContent className="py-12 text-center">
        <div className="space-y-4">
          <CardTitle className="font-semibold text-xl">
            Mini App Required
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            DEGEN rewards require identity verification.
            <br />
            Please open this app from within Farcaster or Base app.
          </p>
          <Button className="mt-2" onClick={handleOpenInApp} variant="outline">
            Open in App
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
