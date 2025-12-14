"use client";

import { memo } from "react";
import { ShareGMStatus } from "@/components/share-gm-status";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ShareModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  claimedToday?: boolean;
  completedAllChains?: boolean;
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
            size="default"
            variant="outline"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
);
