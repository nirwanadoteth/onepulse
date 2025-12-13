"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AboutContent } from "../about/about-content";

type AboutDialogProps = {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
};

export function AboutDialog({ open, onOpenChangeAction }: AboutDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChangeAction} open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>About OnePulse</DialogTitle>
          <DialogDescription className="sr-only">
            Learn more about OnePulse and how to get help
          </DialogDescription>
        </DialogHeader>
        <AboutContent />
      </DialogContent>
    </Dialog>
  );
}
