"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useAccount } from "wagmi"

import { useGmStats } from "@/hooks/use-gm-stats"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"

import { DisconnectWallet } from "./wallet"

export type MiniAppUser = {
  fid: number
  displayName: string
  username: string
  pfpUrl?: string
}

export const Profile = React.memo(function Profile({
  user,
  isSmartWallet,
  onDisconnected,
}: {
  user?: MiniAppUser
  isSmartWallet?: boolean
  onDisconnected?: () => void
}) {
  const { address } = useAccount()
  const defaultStats = useMemo(
    () => ({
      currentStreak: 0,
      highestStreak: 0,
      allTimeGmCount: 0,
      lastGmDay: 0,
    }),
    []
  )

  const chains = useMemo(() => {
    const list = [
      { id: 8453, name: "Base" },
      { id: 42220, name: "Celo" },
      { id: 10, name: "Optimism" },
    ] as const
    return isSmartWallet ? list.filter((c) => c.id !== 42220) : list
  }, [isSmartWallet])

  const [selectedChainId, setSelectedChainId] = useState<number>(8453)
  // Ensure selected chain remains valid if list changes
  useEffect(() => {
    if (!chains.find((c) => c.id === selectedChainId)) {
      const id = setTimeout(() => setSelectedChainId(8453), 0)
      return () => clearTimeout(id)
    }
  }, [chains, selectedChainId])

  const { stats: selectedStats, isReady } = useGmStats(address, selectedChainId)

  // Note: We rely on the query key (which includes the address) to fetch on wallet change.
  // GM success flow already invalidates this key to refresh immediately after reporting.

  return (
    <div className="mt-4 space-y-4">
      {user && (
        <Item variant="outline">
          <ItemMedia>
            <Avatar className="size-16">
              <AvatarImage src={user.pfpUrl} alt={user.displayName} />
              <AvatarFallback>User</AvatarFallback>
            </Avatar>
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{user.displayName}</ItemTitle>
            <ItemDescription>@{user.username}</ItemDescription>
            <ItemDescription>FID: {user.fid}</ItemDescription>
          </ItemContent>
        </Item>
      )}

      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>GM Streak</CardTitle>
            <CardDescription>
              Select a chain to view your onchain GM stats
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="sr-only">Chain</span>
            <Select
              value={String(selectedChainId)}
              onValueChange={(v) => setSelectedChainId(Number(v))}
            >
              <SelectTrigger size="sm" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {chains.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-semibold">
                {(selectedStats ?? defaultStats).currentStreak}
              </div>
              <div className="text-muted-foreground text-xs">Current</div>
            </div>
            <div>
              <div className="text-2xl font-semibold">
                {(selectedStats ?? defaultStats).highestStreak}
              </div>
              <div className="text-muted-foreground text-xs">Highest</div>
            </div>
            <div>
              <div className="text-2xl font-semibold">
                {(selectedStats ?? defaultStats).allTimeGmCount}
              </div>
              <div className="text-muted-foreground text-xs">All-time</div>
            </div>
          </div>
          {!isReady && address && (
            <div className="text-muted-foreground mt-3 flex items-center gap-2 text-xs">
              <Spinner className="size-3" />
              <span>Updating…</span>
            </div>
          )}
        </CardContent>
      </Card>
      <DisconnectWallet onDisconnected={onDisconnected} />
    </div>
  )
})
