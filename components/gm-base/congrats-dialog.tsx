"use client"

import React from "react"
import dynamic from "next/dynamic"

import { Button } from "@/components/ui/button"
import type { ConfettiRef } from "@/components/ui/confetti"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const Confetti = dynamic(
  () => import("@/components/ui/confetti").then((m) => m.Confetti),
  { ssr: false }
)

interface CongratsDialogProps {
  open: boolean
  nextTargetSec: number
  onOpenChange: (open: boolean) => void
  confettiRef: React.RefObject<ConfettiRef>
}

/**
 * Congratulations dialog shown when all chains are completed
 * Displays countdown to next GM time and triggers confetti animation
 */
export const CongratsDialog = React.memo(function CongratsDialog({
  open,
  nextTargetSec,
  onOpenChange,
  confettiRef,
}: CongratsDialogProps) {
  const handleClose = React.useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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

        <DialogFooter>
          <Button className="w-full" onClick={handleClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
      <Confetti
        ref={confettiRef}
        className="pointer-events-none absolute top-0 left-0 z-0 size-full"
      />
    </Dialog>
  )
})

// Lightweight countdown that only updates itself once per second
const CountdownValue = React.memo(function CountdownValue({
  targetSec,
}: {
  targetSec: number
}) {
  const [text, setText] = React.useState("--:--:--")
  React.useEffect(() => {
    if (!targetSec) return
    const format = (ms: number) => {
      const total = Math.max(0, Math.floor(ms / 1000))
      const h = Math.floor(total / 3600)
      const m = Math.floor((total % 3600) / 60)
      const s = total % 60
      const pad = (n: number) => String(n).padStart(2, "0")
      return `${pad(h)}:${pad(m)}:${pad(s)}`
    }
    const update = () => {
      const nowSec = Math.floor(Date.now() / 1000)
      const ms = Math.max(0, (targetSec - nowSec) * 1000)
      setText(format(ms))
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [targetSec])
  return <>{text}</>
})
