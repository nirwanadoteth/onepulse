"use client"

import { useEffect, useRef } from "react"

import type { ConfettiRef } from "@/components/ui/confetti"

import { getCurrentDay } from "./chain-config"

/**
 * Manages confetti animation trigger logic
 * Only fires confetti once per day, after dialog is shown, and only if user is connected
 */
export function useConfettiControl(
  showCongrats: boolean,
  isConnected: boolean
) {
  const confettiRef = useRef<ConfettiRef>(null)
  const confettiTriggeredRef = useRef<number | null>(null)

  // Trigger confetti after congratulations dialog is shown (only when connected)
  useEffect(() => {
    if (!showCongrats || !isConnected) return
    const today = getCurrentDay()
    if (confettiTriggeredRef.current === today) return

    confettiTriggeredRef.current = today
    const rafId = window.requestAnimationFrame(() => {
      confettiRef.current?.fire()
    })

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [showCongrats, isConnected])

  return { confettiRef, canFireConfetti: () => confettiTriggeredRef.current }
}
