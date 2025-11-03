import { useEffect, useState } from "react"
import { useReducedMotion } from "motion/react"

function handleReducedMotion(setShowParticles: (show: boolean) => void) {
  let rafId: number | null = null
  if (typeof window !== "undefined") {
    rafId = window.requestAnimationFrame(() => setShowParticles(false))
  }
  return () => {
    if (rafId != null) {
      window.cancelAnimationFrame(rafId)
    }
  }
}

function scheduleParticlesDisplay(setShowParticles: (show: boolean) => void) {
  let cancelled = false
  let idleHandle: number | null = null
  let timeoutHandle: number | null = null

  const schedule = () => {
    if (!cancelled) {
      setShowParticles(true)
    }
  }

  if (typeof window !== "undefined") {
    const idleWindow = window as typeof window & {
      requestIdleCallback?: (
        callback: IdleRequestCallback,
        options?: IdleRequestOptions
      ) => number
      cancelIdleCallback?: (handle: number) => void
    }

    if (idleWindow.requestIdleCallback) {
      idleHandle = idleWindow.requestIdleCallback(schedule, { timeout: 800 })
    } else {
      timeoutHandle = window.setTimeout(schedule, 0)
    }
  }

  return () => {
    cancelled = true
    if (idleHandle != null) {
      const idleWindow = window as typeof window & {
        cancelIdleCallback?: (handle: number) => void
      }
      idleWindow.cancelIdleCallback?.(idleHandle)
    }
    if (timeoutHandle != null) {
      clearTimeout(timeoutHandle)
    }
  }
}

export function useParticlesAnimation() {
  const prefersReducedMotion = useReducedMotion()
  const [showParticles, setShowParticles] = useState(false)

  useEffect(() => {
    if (prefersReducedMotion) {
      return handleReducedMotion(setShowParticles)
    }

    return scheduleParticlesDisplay(setShowParticles)
  }, [prefersReducedMotion])

  return { showParticles, prefersReducedMotion }
}
