"use client";

import { Share2 } from "lucide-react";
import { memo } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { GmStats } from "@/hooks/use-gm-stats";
import { CountdownValue } from "./countdown-value";
import { useCongratsDialogLogic } from "./use-congrats-dialog-logic";

type CongratsDialogProps = {
  open: boolean;
  nextTargetSec: number;
  onOpenChange: (open: boolean) => void;
  onShare?: () => void;
  gmStats?: GmStats;
};

/**
 * Congratulations dialog shown when all chains are completed
 * Displays countdown to next GM time and triggers confetti animation
 */
export const CongratsDialog = memo(
  ({
    open,
    nextTargetSec,
    onOpenChange,
    onShare,
    gmStats,
  }: CongratsDialogProps) => {
    const { handleClose, handleShare, showShareButton } =
      useCongratsDialogLogic({
        onOpenChange,
        onShare,
        gmStats,
      });

    return (
      <Dialog onOpenChange={onOpenChange} open={open}>
        <DialogContent className="text-center sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Congratulations 🎉</DialogTitle>
            <DialogDescription className="sr-only">
              You completed GM on all chains
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <p>
              You already completed GM on all chains, come back in{" "}
              <CountdownValue targetSec={nextTargetSec} /> to continue your
              streaks!
            </p>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            {showShareButton && (
              <Button
                className="w-full sm:flex-1"
                onClick={handleShare}
                variant="outline"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share Progress
              </Button>
            )}
            <Button className="w-full sm:flex-1" onClick={handleClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
);

CongratsDialog.displayName = "CongratsDialog";
