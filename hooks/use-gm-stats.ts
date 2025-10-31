"use client"

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"
import { gmStatsByAddressStore } from "@/stores/gm-store"

export type GmStats = {
  currentStreak: number
  highestStreak: number
  allTimeGmCount: number
  lastGmDay: number
}

const ZERO: GmStats = {
  currentStreak: 0,
  highestStreak: 0,
  allTimeGmCount: 0,
  lastGmDay: 0,
}

export function useGmStats(address?: string | null, chainId?: number) {
  // Start/refresh subscription for the current address
  useEffect(() => {
    if (!address) return
    gmStatsByAddressStore.subscribeToAddress(address)
  }, [address])

  // Subscribe to store updates with an external store pattern
  const snapshot = useSyncExternalStore(
    (cb) => gmStatsByAddressStore.subscribe(cb),
    () => gmStatsByAddressStore.getSnapshot(),
    () => gmStatsByAddressStore.getServerSnapshot()
  )

  // One-time API fallback when the subscription is slow to populate
  const [fallbackStats, setFallbackStats] = useState<
    | {
        key: string
        stats: GmStats
      }
    | undefined
  >()
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const keyRef = useRef<string>("")

  useEffect(() => {
    if (!address) return

    const key = `${address}:${chainId ?? "all"}`
    if (keyRef.current !== key) {
      keyRef.current = key
    }

    const lower = address.toLowerCase()
    const rows = snapshot.filter((r) => r.address.toLowerCase() === lower)
    const subReady = gmStatsByAddressStore.isSubscribedForAddress(address)

    const hasSubData =
      typeof chainId === "number"
        ? rows.some((r) => r.chainId === chainId)
        : rows.length > 0

    // If we already have data via subscription, skip fallback
    if (subReady && hasSubData) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      return
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(async () => {
      try {
        // Re-check latest state before performing fetch
        const latestRows = gmStatsByAddressStore
          .getSnapshot()
          .filter((r) => r.address.toLowerCase() === lower)
        const latestReady =
          gmStatsByAddressStore.isSubscribedForAddress(address)
        const latestHasData =
          typeof chainId === "number"
            ? latestRows.some((r) => r.chainId === chainId)
            : latestRows.length > 0
        if (latestReady && latestHasData) return

        const url = new URL("/api/gm/stats", window.location.origin)
        url.searchParams.set("address", address)
        if (typeof chainId === "number")
          url.searchParams.set("chainId", String(chainId))
        const res = await fetch(url.toString())
        if (res.ok) {
          const json = (await res.json()) as GmStats
          setFallbackStats({
            key,
            stats: {
              currentStreak: json.currentStreak ?? 0,
              highestStreak: json.highestStreak ?? 0,
              allTimeGmCount: json.allTimeGmCount ?? 0,
              lastGmDay: json.lastGmDay ?? 0,
            },
          })
        }
      } catch {
        // Ignore fallback failures
      }
    }, 1500)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [address, chainId, snapshot])

  // Derive stats from subscription snapshot
  const subDerived: GmStats | undefined = useMemo(() => {
    if (!address) return undefined
    const rows = snapshot.filter(
      (r) => r.address.toLowerCase() === address.toLowerCase()
    )
    if (typeof chainId === "number") {
      const row = rows.find((r) => r.chainId === chainId)
      return row
        ? {
            currentStreak: row.currentStreak ?? 0,
            highestStreak: row.highestStreak ?? 0,
            allTimeGmCount: row.allTimeGmCount ?? 0,
            lastGmDay: row.lastGmDay ?? 0,
          }
        : undefined
    }
    if (!rows.length) return undefined
    return rows.reduce<GmStats>(
      (acc, r) => ({
        currentStreak: 0,
        highestStreak: Math.max(acc.highestStreak, r.highestStreak ?? 0),
        allTimeGmCount: acc.allTimeGmCount + (r.allTimeGmCount ?? 0),
        lastGmDay: Math.max(acc.lastGmDay, r.lastGmDay ?? 0),
      }),
      ZERO
    )
  }, [address, chainId, snapshot])

  // Prefer subscription data; fallback to API once if needed
  const currentKey = `${address ?? ""}:${chainId ?? "all"}`
  const fallbackForKey =
    fallbackStats && fallbackStats.key === currentKey
      ? fallbackStats.stats
      : undefined
  const stats: GmStats = subDerived ?? fallbackForKey ?? ZERO
  const isReady =
    gmStatsByAddressStore.isSubscribedForAddress(address) ||
    Boolean(fallbackForKey)

  return { stats, isReady }
}
