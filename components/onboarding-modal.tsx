"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useOnboardingModalLogic } from "./onboarding-modal/use-onboarding-modal-logic";

type OnboardingModalProps = {
  open: boolean;
  onCloseAction: () => void;
  canSave?: boolean;
  onSaveAction?: () => void;
};

export const OnboardingModal = ({
  open,
  onCloseAction,
  canSave,
  onSaveAction,
}: OnboardingModalProps) => {
  const { handleSaveAndClose } = useOnboardingModalLogic(
    onCloseAction,
    onSaveAction
  );

  return (
    <Dialog onOpenChange={(val) => !val && onCloseAction()} open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to OnePulse</DialogTitle>
          <DialogDescription>
            Send GM daily on multiple chains to earn rewards and build streaks.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">How it works:</h4>
            <ul className="mt-2 ml-4 list-disc space-y-1 text-muted-foreground text-sm">
              <li>Connect your wallet</li>
              <li>Send GM on Base</li>
              <li>Earn rewards for daily participation</li>
              <li>Track streaks in Profile</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onCloseAction} type="button" variant="secondary">
            Got it
          </Button>
          {canSave && onSaveAction && (
            <Button onClick={handleSaveAndClose} type="button">
              Save now
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
