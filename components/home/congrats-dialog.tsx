"use client";

import { Share2 } from "lucide-react";
import { memo, useCallback, useEffect, useState } from "react";

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
import { shouldShowShareButton } from "@/lib/share";

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
    const handleClose = useCallback(() => {
      onOpenChange(false);
    }, [onOpenChange]);

    const handleShare = useCallback(() => {
      handleClose();
      onShare?.();
    }, [handleClose, onShare]);

    const showShareButton = shouldShowShareButton(gmStats);

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
              You already completed GM on all chains, comeback in{" "}
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

const CountdownValue = memo(({ targetSec }: { targetSec: number }) => {
  const [text, setText] = useState("--:--:--");
  useEffect(() => {
    if (!targetSec) {
      return;
    }
    const format = (ms: number) => {
      const total = Math.max(0, Math.floor(ms / 1000));
      const h = Math.floor(total / 3600);
      const m = Math.floor((total % 3600) / 60);
      const s = total % 60;
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${pad(h)}:${pad(m)}:${pad(s)}`;
    };
    const update = () => {
      const nowSec = Math.floor(Date.now() / 1000);
      const ms = Math.max(0, (targetSec - nowSec) * 1000);
      setText(format(ms));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [targetSec]);
  return <>{text}</>;
});
