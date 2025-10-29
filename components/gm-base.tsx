"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useAppKitAccount } from "@reown/appkit/react"

import { DAILY_GM_ADDRESSES } from "@/lib/constants"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Confetti, type ConfettiRef } from "@/components/ui/confetti"
import { GMChainCard } from "@/components/gm/GMChainCard"

import { Button } from "./ui/button"

export const GMBase = React.memo(function GMBase({
  isSmartWallet,
  sponsored,
}: {
  isSmartWallet?: boolean
  sponsored?: boolean
}) {
  const { isConnected, address } = useAppKitAccount()
  // Use stable, theme-agnostic icons at SSR to avoid hydration mismatch.
  const celoIcon = "/celomark.png"
  const opIcon = "/opmark.png"

  // Define supported chains here; adding a new chain is a one-liner.
  const chains = useMemo(() => {
    const list = [
      { id: 8453, name: "Base", iconSrc: "/basemark.png" },
      { id: 42220, name: "Celo", iconSrc: celoIcon },
      { id: 10, name: "Optimism", iconSrc: opIcon },
    ] as const
    const hideCelo = Boolean(isSmartWallet)
    return hideCelo ? list.filter((c) => c.id !== 42220) : list
  }, [isSmartWallet])

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

  const [countdown, setCountdown] = useState("--:--:--")
  useEffect(() => {
    if (!allDone || !nextTargetSec) return
    const fmt = (ms: number) => {
      const total = Math.max(0, Math.floor(ms / 1000))
      const h = Math.floor(total / 3600)
      const m = Math.floor((total % 3600) / 60)
      const s = total % 60
      const pad = (n: number) => String(n).padStart(2, "0")
      return `${pad(h)}:${pad(m)}:${pad(s)}`
    }
    const tick = () => {
      const nowSec = Math.floor(Date.now() / 1000)
      const ms = Math.max(0, (nextTargetSec - nowSec) * 1000)
      setCountdown(fmt(ms))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [allDone, nextTargetSec])

  // Confetti control
  const confettiRef = useRef<ConfettiRef>(null)
  const [showCongrats, setShowCongrats] = useState(false)

  useEffect(() => {
    if (allDone) {
      const id = setTimeout(() => {
        setShowCongrats(true)
        confettiRef.current?.fire()
      }, 0)
      return () => clearTimeout(id)
    }
  }, [allDone])

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
            iconSrc={c.iconSrc}
            contractAddress={contractAddress}
            isConnected={Boolean(isConnected)}
            address={address}
            onStatusChange={handleStatus}
            sponsored={Boolean(sponsored) && c.id === 8453}
          />
        )
      })}

      {showCongrats && allDone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 z-10 bg-black/40"
            onClick={() => setShowCongrats(false)}
          />
          <Card className="relative z-20 w-full max-w-sm rounded-2xl text-center">
            <CardHeader>
              <CardTitle>Congratulations 🎉</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                You already completed GM on all chains, comeback in {countdown}{" "}
                to continue your streaks!
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
