"use client";

import { memo } from "react";
import { ShareGMStatus } from "@/components/share-gm-status";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { GmStats } from "@/hooks/use-gm-stats";

type ShareModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  claimedToday?: boolean;
  completedAllChains?: boolean;
  gmStats?: GmStats;
};

/**
 * Modal for sharing GM status with Twitter, Cast, or clipboard
 * Used after claiming rewards or completing all chains
 */
export const ShareModal = memo(
  ({
    open,
    onOpenChange,
    title = "Share Your Progress",
    description = "Share your GM achievements with the community",
    claimedToday = false,
    completedAllChains = false,
    gmStats,
  }: ShareModalProps) => (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <ShareGMStatus
            claimedToday={claimedToday}
            completedAllChains={completedAllChains}
            gmStats={gmStats}
            size="default"
            variant="outline"
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)} variant="ghost">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
);
