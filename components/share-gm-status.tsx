"use client";

import { Copy, MessageCircle } from "lucide-react";
import type { GmStats } from "@/hooks/use-gm-stats";
import { cn } from "@/lib/utils";
import { useShareGMStatusLogic } from "./share-gm-status/use-share-gm-status-logic";
import { Button } from "./ui/button";

type ShareGMStatusProps = {
  className?: string;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  claimedToday?: boolean;
  completedAllChains?: boolean;
  gmStats?: GmStats;
};

export function ShareGMStatus({
  className,
  variant = "outline",
  size = "default",
  claimedToday = false,
  completedAllChains = false,
  gmStats,
}: ShareGMStatusProps) {
  const { handleShare } = useShareGMStatusLogic(
    claimedToday,
    completedAllChains,
    gmStats
  );

  return (
    <div className={cn(`${className} flex gap-2`)}>
      <Button
        className="flex-1 gap-2"
        onClick={() => handleShare("cast")}
        size={size}
        variant={variant}
      >
        <MessageCircle className="h-4 w-4" />
        Cast to Share
      </Button>
      <Button
        className="gap-2"
        onClick={() => handleShare("copy")}
        size={size}
        variant={variant}
      >
        <Copy className="h-4 w-4" />
      </Button>
    </div>
  );
}
