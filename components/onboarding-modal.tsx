"use client"

import React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface OnboardingModalProps {
  open: boolean
  onClose: () => void
  canSave?: boolean
  onSave?: () => void
}

export const OnboardingModal = React.memo(function OnboardingModal({
  open,
  onClose,
  canSave,
  onSave,
}: OnboardingModalProps) {
  const handleSaveAndClose = React.useCallback(() => {
    onSave?.()
    onClose()
  }, [onSave, onClose])

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
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
            <ul className="text-muted-foreground mt-2 ml-4 list-disc space-y-1 text-sm">
              <li>Connect your wallet</li>
              <li>Send GM on Base, Celo, or Optimism</li>
              <li>Earn rewards for daily participation</li>
              <li>Track streaks in Profile</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} type="button">
            Got it
          </Button>
          {canSave && onSave && (
            <Button type="button" onClick={handleSaveAndClose}>
              Save now
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})
