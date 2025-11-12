"use client";

import { memo, useCallback } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type OnboardingModalProps = {
  open: boolean;
  onClose: () => void;
  canSave?: boolean;
  onSave?: () => void;
};

export const OnboardingModal = memo(
  ({ open, onClose, canSave, onSave }: OnboardingModalProps) => {
    const handleSaveAndClose = useCallback(() => {
      onSave?.();
      onClose();
    }, [onSave, onClose]);

    return (
      <Dialog onOpenChange={(val) => !val && onClose()} open={open}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Welcome to OnePulse</DialogTitle>
            <DialogDescription>
              Send GM daily on multiple chains to earn rewards and build
              streaks.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">How it works:</h4>
              <ul className="mt-2 ml-4 list-disc space-y-1 text-muted-foreground text-sm">
                <li>Connect your wallet</li>
                <li>Send GM on Base, Celo, or Optimism</li>
                <li>Earn rewards for daily participation</li>
                <li>Track streaks in Profile</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={onClose} type="button" variant="ghost">
              Got it
            </Button>
            {canSave && onSave && (
              <Button onClick={handleSaveAndClose} type="button">
                Save now
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
);
