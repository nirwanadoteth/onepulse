"use client";

import { HowItWorksContent } from "@/components/how-it-works-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type HowItWorksDialogProps = {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
};

export function HowItWorksDialog({
  open,
  onOpenChangeAction,
}: HowItWorksDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChangeAction} open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>How It Works</DialogTitle>
          <DialogDescription className="sr-only">
            Steps to send GM and claim rewards
          </DialogDescription>
        </DialogHeader>
        <HowItWorksContent />
      </DialogContent>
    </Dialog>
  );
}
