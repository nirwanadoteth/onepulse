"use client"

import React from "react"

import { Card, CardContent, CardTitle } from "@/components/ui/card"

export function VerifyingIdentityCard() {
  return (
    <Card className="border-border/50">
      <CardContent className="py-12 text-center">
        <div className="space-y-3">
          <CardTitle className="text-xl font-semibold">
            Verifying Identity
          </CardTitle>
          <div className="text-muted-foreground flex items-center justify-center gap-2 text-xs">
            <div className="h-3 w-3 animate-spin rounded-full border border-amber-500 border-t-transparent" />
            Checking your Farcaster identity
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
