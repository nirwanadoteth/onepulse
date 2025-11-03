"use client"

import React, { useMemo } from "react"
import { useAccount } from "wagmi"

import { DAILY_GM_ADDRESSES } from "@/lib/constants"
import { GMChainCard } from "@/components/gm-chain-card"

import {
  areAllChainsComplete,
  getChainList,
  getNextTargetSec,
} from "./gm-base/chain-config"
import { CongratsDialog } from "./gm-base/congrats-dialog"
import { useConfettiControl } from "./gm-base/use-confetti-control"
import { useCongratsLogic } from "./gm-base/use-congrats-logic"
import { useLastCongratsDay } from "./gm-base/use-last-congrats-day"
import { usePerChainStatus } from "./gm-base/use-per-chain-status"

export const GMBase = React.memo(function GMBase({
  sponsored,
  allowedChainIds,
}: {
  sponsored?: boolean
  allowedChainIds?: number[]
}) {
  const { isConnected, address } = useAccount()

  // Get filtered chain list
  const chains = useMemo(() => getChainList(allowedChainIds), [allowedChainIds])
  const chainIds = useMemo(() => chains.map((c) => c.id), [chains])

  // Track per-chain status
  const { statusMap, handleStatus } = usePerChainStatus()

  // Derive all-done and next target from chain status
  const allDone = useMemo(
    () => areAllChainsComplete(chainIds, statusMap),
    [chainIds, statusMap]
  )

  const nextTargetSec = useMemo(
    () => getNextTargetSec(chainIds, statusMap),
    [chainIds, statusMap]
  )

  // Manage congratulations day persistently
  const { lastCongratsDay, setLastCongratsDay } = useLastCongratsDay()

  // Control confetti animation (gated by isConnected)
  const { confettiRef } = useConfettiControl(false, isConnected) // Will be set by useCongratsLogic

  // Show congratulations dialog when all done
  const { showCongrats, setShowCongrats } = useCongratsLogic({
    allDone,
    isConnected,
    lastCongratsDay,
    onLastCongratsDayUpdate: setLastCongratsDay,
  })

  // Update confetti trigger when showing congrats
  React.useEffect(() => {
    if (showCongrats) {
      confettiRef.current?.fire?.()
    }
  }, [showCongrats, confettiRef])

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
      <CongratsDialog
        open={Boolean(showCongrats && allDone)}
        nextTargetSec={nextTargetSec}
        onOpenChange={(val) => {
          if (!val) setShowCongrats(false)
        }}
        confettiRef={confettiRef}
      />
    </div>
  )
})
