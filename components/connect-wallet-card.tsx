"use client"

import React from "react"

import { Card, CardContent, CardTitle } from "@/components/ui/card"

export function ConnectWalletCard() {
  return (
    <Card className="border-border/50">
      <CardContent className="py-12 text-center">
        <div className="space-y-3">
          <CardTitle className="text-xl font-semibold">
            Connect Wallet
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Connect your wallet to access daily DEGEN rewards
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
