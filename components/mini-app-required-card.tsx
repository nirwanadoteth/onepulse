"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useMiniAppRequiredLogic } from "./mini-app-required-card/use-mini-app-required-logic";

export function MiniAppRequiredCard() {
  const { handleOpenInApp } = useMiniAppRequiredLogic();

  return (
    <Card className="border-border/50">
      <CardContent className="py-12 text-center">
        <div className="space-y-4">
          <CardTitle className="font-semibold text-xl">
            Mini App Required
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Daily rewards require identity verification.
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
