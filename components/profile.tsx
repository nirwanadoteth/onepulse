"use client"

import { Unplug } from 'lucide-react';
import { useMemo } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

export type MiniAppUser = {
  fid: number;
  displayName: string;
  username: string;
  pfpUrl?: string;
};

export function Profile({ user, onDisconnected }: { user?: MiniAppUser; onDisconnected?: () => void }) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  type GmStats = { currentStreak: number; highestStreak: number; allTimeGmCount: number; lastGmDay: number }
  const defaultStats: GmStats = useMemo(
    () => ({ currentStreak: 0, highestStreak: 0, allTimeGmCount: 0, lastGmDay: 0 }),
    []
  )

  const { data: stats, isFetching } = useQuery<GmStats>({
    queryKey: ["gm-stats", address ?? "no-address"],
    enabled: Boolean(address),
    queryFn: async (): Promise<GmStats> => {
      const res = await fetch(`/api/gm/stats?address=${address}`)
      if (!res.ok) throw new Error("Failed to load stats")
      return res.json()
    },
    // Avoid refetching on every tab switch and keep cache warm
    staleTime: 60_000, // 1 minute
    gcTime: 5 * 60_000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true, // only refetch if stale
    // Show zeros instantly, but do NOT seed the cache; ensures immediate fetch on cache miss
    placeholderData: defaultStats,
  })

  const displayStats = stats ?? defaultStats

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
        <CardHeader>
          <CardTitle>GM Streak</CardTitle>
          <CardDescription>Your onchain GM progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-semibold">{displayStats.currentStreak}</div>
              <div className="text-xs text-muted-foreground">Current</div>
            </div>
            <div>
              <div className="text-2xl font-semibold">{displayStats.highestStreak}</div>
              <div className="text-xs text-muted-foreground">Highest</div>
            </div>
            <div>
              <div className="text-2xl font-semibold">{displayStats.allTimeGmCount}</div>
              <div className="text-xs text-muted-foreground">All-time</div>
            </div>
          </div>
          {isFetching && (
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Spinner className="size-3" />
              <span>Updating…</span>
            </div>
          )}
        </CardContent>
      </Card>
      {isConnected && (
        <div className="fixed inset-x-0 bottom-0 z-50 mx-auto w-[95%] max-w-lg p-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              disconnect()
              onDisconnected?.()
            }}
          >
            <Unplug className="mr-2 h-4 w-4" /> Disconnect
          </Button>
        </div>
      )}
    </div>
  );
}
