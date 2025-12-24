"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useAccount } from "wagmi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type LeaderboardEntry = {
  address: string;
  displayName: string | null;
  username: string | null;
  fid: string | null;
  pfpUrl: string | null;
  allTimeGmCount: number;
  rank: number;
};

type LeaderboardResponse = {
  leaderboard: LeaderboardEntry[];
  total: number;
  timestamp: string;
};

const fetcher = async (url: string): Promise<LeaderboardResponse> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch leaderboard");
  }
  return res.json();
};

function shortAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function getDisplayName(entry: LeaderboardEntry): string {
  if (entry.displayName) {
    return entry.displayName;
  }
  if (entry.username) {
    return entry.username;
  }
  return shortAddress(entry.address);
}

function getRankBadge(rank: number, className?: string) {
  if (rank === 1) {
    return <Badge className={className}>🥇</Badge>;
  }
  if (rank === 2) {
    return <Badge className={className}>🥈</Badge>;
  }
  if (rank === 3) {
    return <Badge className={className}>🥉</Badge>;
  }
  if (rank > 100) {
    return <Badge className={className}>100+</Badge>;
  }
  return <Badge className={className}>{rank}</Badge>;
}

function LeaderboardSkeleton() {
  const skeletonIds = [
    "skeleton-1",
    "skeleton-2",
    "skeleton-3",
    "skeleton-4",
    "skeleton-5",
    "skeleton-6",
    "skeleton-7",
    "skeleton-8",
    "skeleton-9",
    "skeleton-10",
  ] as const;

  return (
    <div className="my-12 space-y-1">
      {skeletonIds.map((id) => (
        <div className="flex items-center gap-2 rounded-lg border p-2" key={id}>
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-4 w-12" />
        </div>
      ))}
    </div>
  );
}

export function Leaderboard({ userAddress }: { userAddress?: string }) {
  const { address } = useAccount();
  const currentUserAddress = userAddress || address;

  const apiUrl = currentUserAddress
    ? `/api/leaderboard?limit=10&user=${encodeURIComponent(currentUserAddress)}`
    : "/api/leaderboard?limit=10";

  const { data, error, isLoading } = useQuery<LeaderboardResponse>({
    queryKey: ["leaderboard", currentUserAddress],
    queryFn: () => fetcher(apiUrl),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const { topEntries, userEntry } = useMemo(() => {
    if (!data?.leaderboard) {
      return { topEntries: [], userEntry: undefined };
    }

    const top10 = data.leaderboard.slice(0, 10);
    const user = currentUserAddress
      ? data.leaderboard.find(
          (e) => e.address.toLowerCase() === currentUserAddress.toLowerCase()
        )
      : undefined;

    // If user is in top 10, just show top 10 (highlight user in the list)
    if (user && user.rank <= 10) {
      return { topEntries: top10, userEntry: undefined };
    }

    // If user is outside top 10, show them first, then top 10
    return { topEntries: top10, userEntry: user };
  }, [data?.leaderboard, currentUserAddress]);

  if (isLoading) {
    return <LeaderboardSkeleton />;
  }

  if (error) {
    return (
      <Card className="my-12 border-red-500/50 bg-red-500/5">
        <CardContent className="text-center text-red-600 text-sm dark:text-red-400">
          Failed to load leaderboard
        </CardContent>
      </Card>
    );
  }

  if (topEntries.length === 0 && !userEntry) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground text-sm">
          No GM statistics available yet
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="my-12 space-y-1">
      {userEntry && (
        <>
          <div
            className="flex items-center gap-2 rounded-lg border-2 border-primary bg-primary/5 p-2"
            key={userEntry.address}
          >
            <div className="items-start">
              {getRankBadge(
                userEntry.rank,
                "h-8 w-8 text-sm bg-transparent text-foreground"
              )}
            </div>
            <Avatar className="h-8 w-8">
              {userEntry.pfpUrl && (
                <AvatarImage
                  alt={getDisplayName(userEntry)}
                  loading="lazy"
                  src={userEntry.pfpUrl}
                />
              )}
              <AvatarFallback>
                {getDisplayName(userEntry).charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-sm">
                {getDisplayName(userEntry)}{" "}
                <span className="text-primary">(You)</span>
              </p>
              <p className="text-muted-foreground text-xs">
                @{userEntry.username}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <p className="text-muted-foreground text-xs">
                {userEntry.allTimeGmCount} GM
              </p>
            </div>
          </div>
          <div className="relative my-1 h-px bg-border" />
        </>
      )}

      {topEntries.map((entry) => {
        const isCurrentUser =
          currentUserAddress &&
          entry.address.toLowerCase() === currentUserAddress.toLowerCase();
        return (
          <div
            className={`flex items-center gap-2 rounded-lg border p-2 transition-colors ${
              isCurrentUser
                ? "border-2 border-primary bg-primary/5"
                : "border border-border bg-card hover:bg-accent"
            }`}
            key={entry.address}
          >
            <div className="flex flex-col items-start gap-1">
              {getRankBadge(
                entry.rank,
                "h-8 w-8 text-sm bg-transparent text-foreground"
              )}
            </div>
            <Avatar className="ml-1 h-8 w-8">
              {entry.pfpUrl && (
                <AvatarImage
                  alt={getDisplayName(entry)}
                  loading="lazy"
                  src={entry.pfpUrl}
                />
              )}
              <AvatarFallback>
                {getDisplayName(entry).charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-sm">
                {getDisplayName(entry)}
                {isCurrentUser && <span className="text-primary"> (You)</span>}
              </p>
              <p className="text-muted-foreground text-xs">@{entry.username}</p>
            </div>
            <div className="items-end">
              <p className="text-muted-foreground text-xs">
                {entry.allTimeGmCount} GM
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
