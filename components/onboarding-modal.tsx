"use client"

import { useEffect, useRef } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface OnboardingModalProps {
  open: boolean
  onClose: () => void
  canSave?: boolean
  onSave?: () => void
}

export function OnboardingModal({
  open,
  onClose,
  canSave,
  onSave,
}: OnboardingModalProps) {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!open) return
    // Focus the close button when opening for basic accessibility
    const id = requestAnimationFrame(() => closeBtnRef.current?.focus())
    return () => cancelAnimationFrame(id)
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal card */}
      <Card
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        className="relative z-10 w-full max-w-sm"
      >
        <CardHeader>
          <CardTitle>Welcome to OnePulse</CardTitle>
          <CardDescription>
            Stay consistent across Base, Optimism, and Celo. Save OnePulse for
            fast access and optional reminders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 text-sm">
            <li>Save OnePulse for one-tap access</li>
            <li>Open OnePulse to GM each day</li>
            <li>Track streaks in Profile</li>
          </ul>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          {canSave && onSave && (
            <Button type="button" onClick={onSave}>
              Save now
            </Button>
          )}
          <Button
            type="button"
            ref={closeBtnRef}
            variant="outline"
            onClick={onClose}
          >
            Got it
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
