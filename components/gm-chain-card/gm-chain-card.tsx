"use client"

import React, { useEffect, useMemo } from "react"
import { type Address } from "viem"
import { useChainId, useReadContract } from "wagmi"
import { base, celo, optimism } from "wagmi/chains"

import { dailyGMAbi } from "@/lib/abi/daily-gm"
import { GmStats } from "@/hooks/use-gm-stats"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemMedia,
} from "@/components/ui/item"
import { Spinner } from "@/components/ui/spinner"
import { Icons } from "@/components/icons"

import { CarouselNext, CarouselPrevious } from "../ui/carousel"
import { ActionButton } from "./action-button"
import { CountdownText } from "./countdown-text"

// Helper functions - extracted for clarity and testability
const computeGMState = (
  address: string | undefined,
  contractAddress: `0x${string}`,
  isConnected: boolean,
  lastGmDayData: unknown,
  isPendingLastGm: boolean
) => {
  if (!address || !contractAddress) {
    return { hasGmToday: false, gmDisabled: !isConnected, targetSec: 0 }
  }

  if (lastGmDayData === undefined) {
    return { hasGmToday: false, gmDisabled: true, targetSec: 0 }
  }

  const lastDay = Number((lastGmDayData as bigint) ?? 0n)
  const nowSec = Math.floor(Date.now() / 1000)
  const currentDay = Math.floor(nowSec / 86400)
  const alreadyGmToday = lastDay >= currentDay
  const nextDayStartSec = (currentDay + 1) * 86400

  return {
    hasGmToday: alreadyGmToday,
    gmDisabled: alreadyGmToday || isPendingLastGm,
    targetSec: nextDayStartSec,
  }
}

const getChainBtnClasses = (chainId: number, name: string): string => {
  const isCelo = name.toLowerCase() === "celo" || chainId === 42220
  const isOptimism = name.toLowerCase() === "optimism" || chainId === 10

  if (isCelo)
    return "bg-[#FCFF52] text-black hover:bg-[#FCFF52]/90 dark:bg-[#476520] dark:text-white dark:hover:bg-[#476520]/90"
  if (isOptimism) return "bg-[#ff0420] text-white hover:bg-[#ff0420]/90"
  return "bg-[#0052ff] text-white hover:bg-[#0052ff]/90"
}

const getChainIconName = (chainId: number, name: string): string => {
  if (name.toLowerCase() === "optimism" || chainId === 10) return "optimism"
  if (name.toLowerCase() === "celo" || chainId === 42220) return "celo"
  return "base"
}

// Separate stats display component to reduce complexity
const StatsDisplay = React.memo(function StatsDisplay({
  stats,
  isConnected,
  isStatsReady,
}: {
  stats: GmStats
  isConnected: boolean
  isStatsReady: boolean
}) {
  if (!isConnected || !stats) {
    return (
      <div className="text-muted-foreground text-xs">
        Connect wallet to see stats
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-3 text-center">
      <StatColumn
        value={isStatsReady ? stats.currentStreak : undefined}
        label="Current"
      />
      <StatColumn
        value={isStatsReady ? stats.highestStreak : undefined}
        label="Highest"
      />
      <StatColumn
        value={isStatsReady ? stats.allTimeGmCount : undefined}
        label="All-Time"
      />
    </div>
  )
})

// Individual stat column to reduce repetition
const StatColumn = React.memo(function StatColumn({
  value,
  label,
}: {
  value: number | undefined
  label: string
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-2xl font-bold tracking-tight">
        {value !== undefined ? value : <Spinner className="inline h-6 w-6" />}
      </span>
      <span className="text-muted-foreground text-xs font-medium">{label}</span>
    </div>
  )
})

export type GMChainCardProps = {
  chainId: number
  name: string
  contractAddress: `0x${string}`
  isConnected: boolean
  address?: string
  onStatusChange?: (status: {
    chainId: number
    hasGmToday: boolean
    targetSec: number
  }) => void
  sponsored: boolean
  stats: GmStats
  isStatsReady: boolean
  onOpenModal?: (refetch: () => Promise<unknown>) => void
}

export const GMChainCard = React.memo(function GMChainCard({
  chainId,
  name,
  contractAddress,
  isConnected,
  address,
  onStatusChange,
  stats,
  isStatsReady,
  onOpenModal,
}: GMChainCardProps) {
  const currentChainId = useChainId()
  const onCorrectChain = currentChainId === chainId

  const {
    data: lastGmDayData,
    isPending: isPendingLastGm,
    refetch: refetchLastGmDay,
  } = useReadContract({
    chainId: chainId as typeof base.id | typeof celo.id | typeof optimism.id,
    abi: dailyGMAbi,
    address: contractAddress,
    functionName: "lastGMDay",
    args: address ? [address as Address] : undefined,
    query: { enabled: Boolean(address && contractAddress) },
  })

  const { hasGmToday, gmDisabled, targetSec } = useMemo(
    () =>
      computeGMState(
        address,
        contractAddress,
        isConnected,
        lastGmDayData,
        isPendingLastGm
      ),
    [address, contractAddress, isConnected, lastGmDayData, isPendingLastGm]
  )

  useEffect(() => {
    onStatusChange?.({ chainId, hasGmToday, targetSec })
  }, [chainId, hasGmToday, targetSec, onStatusChange])

  const chainBtnClasses = useMemo(
    () => getChainBtnClasses(chainId, name),
    [chainId, name]
  )

  const chainIconName = useMemo(
    () => getChainIconName(chainId, name),
    [chainId, name]
  )

  // Callback to open modal with refetch function
  const handleOpenModal = React.useCallback(() => {
    if (onOpenModal) {
      onOpenModal(refetchLastGmDay)
    }
  }, [onOpenModal, refetchLastGmDay])

  return (
    <>
      <Item variant="outline">
        <ItemContent>
          <ItemMedia>
            {Icons[chainIconName as keyof typeof Icons]?.({
              className: "h-8 w-24 text-current",
              role: "img",
              "aria-label": `${name} wordmark`,
              focusable: false,
            })}
          </ItemMedia>
          <ItemDescription>Amplify your {name} GM</ItemDescription>
        </ItemContent>
        <ItemActions>
          <div className="flex items-center justify-center gap-2">
            <CarouselPrevious className="static translate-y-0" />
            <CarouselNext className="static translate-y-0" />
          </div>
        </ItemActions>
        <ItemFooter className="flex-col">
          <div className="mb-4 w-full">
            <StatsDisplay
              stats={stats}
              isConnected={isConnected}
              isStatsReady={isStatsReady}
            />
          </div>
          <ActionButton
            isConnected={isConnected}
            chainId={chainId}
            name={name}
            onCorrectChain={onCorrectChain}
            hasGmToday={hasGmToday}
            gmDisabled={gmDisabled}
            targetSec={targetSec}
            chainBtnClasses={chainBtnClasses}
            onOpenModal={() => handleOpenModal()}
            renderCountdown={(sec: number) => <CountdownText targetSec={sec} />}
          />
        </ItemFooter>
      </Item>
    </>
  )
})
