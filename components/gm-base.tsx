"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { useAccount } from "wagmi"

import { DAILY_GM_ADDRESSES } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { ConfettiRef } from "@/components/ui/confetti"
import { GMChainCard } from "@/components/gm-chain-card"

const CONGRATS_KEY = "onepulse:last-congrats-day"

// Defer canvas-confetti until needed (modal open)
const Confetti = dynamic(
  () => import("@/components/ui/confetti").then((m) => m.Confetti),
  { ssr: false }
)

const getCurrentDay = () => Math.floor(Date.now() / 86400)

export const GMBase = React.memo(function GMBase({
  sponsored,
  allowedChainIds,
}: {
  sponsored?: boolean
  allowedChainIds?: number[]
}) {
  const { isConnected, address } = useAccount()

  // Define supported chains here; adding a new chain is a one-liner.
  const chains = useMemo(() => {
    let list: Array<{ id: number; name: string }> = [
      { id: 8453, name: "Base" },
      { id: 42220, name: "Celo" },
      { id: 10, name: "Optimism" },
    ]
    if (Array.isArray(allowedChainIds) && allowedChainIds.length > 0) {
      // Enforce explicit allowlist (e.g., Base App: Base + Optimism)
      list = list.filter((c) => allowedChainIds.includes(c.id))
    }
    return list
  }, [allowedChainIds])

  // Track per-chain GM status to determine if all chains are completed
  const [statusMap, setStatusMap] = useState<
    Record<number, { hasGmToday: boolean; targetSec: number }>
  >({})
  const handleStatus = useCallback(
    (s: { chainId: number; hasGmToday: boolean; targetSec: number }) => {
      setStatusMap((prev) => {
        if (
          prev[s.chainId]?.hasGmToday === s.hasGmToday &&
          prev[s.chainId]?.targetSec === s.targetSec
        )
          return prev
        return {
          ...prev,
          [s.chainId]: { hasGmToday: s.hasGmToday, targetSec: s.targetSec },
        }
      })
    },
    []
  )

  const allDone = useMemo(() => {
    const ids = chains.map((c) => c.id)
    if (ids.some((id) => statusMap[id] == null)) return false
    return ids.every((id) => statusMap[id]?.hasGmToday)
  }, [chains, statusMap])

  // Compute earliest next GM time among chains
  const nextTargetSec = useMemo(() => {
    const targets = chains
      .map((c) => statusMap[c.id]?.targetSec || 0)
      .filter((t) => t > 0)
    return targets.length ? Math.min(...targets) : 0
  }, [chains, statusMap])

  // Countdown moved to an isolated child to avoid re-rendering the whole component every second

  // Confetti control
  const confettiRef = useRef<ConfettiRef>(null)
  const [showCongrats, setShowCongrats] = useState(false)
  const [lastCongratsDay, setLastCongratsDay] = useState<number | null>(() => {
    if (typeof window === "undefined") return null
    const stored = window.localStorage.getItem(CONGRATS_KEY)
    if (!stored) return null
    const parsed = Number.parseInt(stored, 10)
    return Number.isNaN(parsed) ? null : parsed
  })

  useEffect(() => {
    if (lastCongratsDay == null) return
    if (typeof window === "undefined") return
    try {
      window.localStorage.setItem(CONGRATS_KEY, String(lastCongratsDay))
    } catch {
      // Ignore persistence errors (e.g., quota, private mode)
    }
  }, [lastCongratsDay])

  useEffect(() => {
    if (!allDone) return
    const today = getCurrentDay()
    if (lastCongratsDay === today) return

    let rafId: number | null = null
    const id = window.setTimeout(() => {
      setShowCongrats(true)
      setLastCongratsDay(today)
      rafId = window.requestAnimationFrame(() => confettiRef.current?.fire())
    }, 0)

    return () => {
      clearTimeout(id)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [allDone, lastCongratsDay])

  return (
    <div className="mt-4 space-y-4">
      {chains.map((c) => {
        const contractAddress = DAILY_GM_ADDRESSES[c.id]
        if (!contractAddress) return null
        return (
          <GMChainCard
            key={c.id}
            chainId={c.id}
            name={c.name}
            contractAddress={contractAddress}
            isConnected={Boolean(isConnected)}
            address={address}
            onStatusChange={handleStatus}
            sponsored={Boolean(sponsored) && c.id === 8453}
          />
        )
      })}
      {showCongrats && allDone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 z-10 bg-black/40"
            onClick={() => setShowCongrats(false)}
          />
          <Card className="relative z-20 w-[95%] max-w-sm rounded-2xl text-center">
            <CardHeader>
              <CardTitle>Congratulations 🎉</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                You already completed GM on all chains, comeback in{" "}
                <CountdownValue targetSec={nextTargetSec} /> to continue your
                streaks!
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => setShowCongrats(false)}>
                Close
              </Button>
            </CardFooter>
          </Card>
          <Confetti
            ref={confettiRef}
            className="pointer-events-none absolute top-0 left-0 z-0 size-full"
          />
        </div>
      )}
    </div>
  )
})

// Lightweight countdown that only updates itself once per second
const CountdownValue = React.memo(function CountdownValue({
  targetSec,
}: {
  targetSec: number
}) {
  const [text, setText] = useState("--:--:--")
  useEffect(() => {
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
