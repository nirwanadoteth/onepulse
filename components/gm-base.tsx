"use client"

import React, { useMemo } from "react"
import { useAccount } from "wagmi"

import { DAILY_GM_ADDRESSES } from "@/lib/constants"
import { useGmStats } from "@/hooks/use-gm-stats"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import { GMChainCard } from "@/components/gm-chain-card"

import {
  areAllChainsComplete,
  getChainList,
  getNextTargetSec,
} from "./gm-base/chain-config"
import { CongratsDialog } from "./gm-base/congrats-dialog"
import { ModalRenderer } from "./gm-base/modal-renderer"
import { useConfettiControl } from "./gm-base/use-confetti-control"
import { useCongratsLogic } from "./gm-base/use-congrats-logic"
import { useLastCongratsDay } from "./gm-base/use-last-congrats-day"
import { useModalManagement } from "./gm-base/use-modal-management"
import { usePerChainStatus } from "./gm-base/use-per-chain-status"

export const GMBase = React.memo(function GMBase({
  sponsored,
  allowedChainIds,
}: {
  sponsored?: boolean
  allowedChainIds?: number[]
}) {
  const { isConnected, address } = useAccount()
  const {
    activeModalChainId,
    processing,
    setActiveModalChainId,
    setProcessing,
  } = useModalManagement()

  // Store refetch function for active chain
  const [activeRefetchFn, setActiveRefetchFn] = React.useState<
    (() => Promise<unknown>) | undefined
  >(undefined)

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

  const { confettiRef } = useConfettiControl(false, isConnected)

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
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Daily GM</h2>
        <p className="text-muted-foreground text-sm">
          Send GM daily on each chain to earn rewards
        </p>
      </div>

      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {chains.map((c) => {
            const contractAddress = DAILY_GM_ADDRESSES[c.id]
            return contractAddress ? (
              <CarouselItem key={c.id} className="basis-full pl-2 md:pl-4">
                <ChainSlide
                  chainId={c.id}
                  chainName={c.name}
                  contractAddress={contractAddress}
                  isConnected={Boolean(isConnected)}
                  address={address}
                  sponsored={Boolean(sponsored) && c.id === 8453}
                  onStatusChange={handleStatus}
                  onOpenModal={(refetch) => {
                    setActiveModalChainId(c.id)
                    setActiveRefetchFn(() => refetch)
                  }}
                />
              </CarouselItem>
            ) : null
          })}
        </CarouselContent>
      </Carousel>

      {/* Global modal rendered at root level */}
      <ModalRenderer
        activeModalChainId={activeModalChainId}
        chains={chains}
        sponsored={Boolean(sponsored)}
        address={address}
        processing={processing}
        setProcessing={setProcessing}
        refetchLastGmDay={activeRefetchFn}
        onClose={() => {
          setActiveModalChainId(null)
          setProcessing(false)
        }}
      />

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

// Separate component to handle per-chain stats
const ChainSlide = React.memo(function ChainSlide({
  chainId,
  chainName,
  contractAddress,
  isConnected,
  address,
  sponsored,
  onStatusChange,
  onOpenModal,
}: {
  chainId: number
  chainName: string
  contractAddress: `0x${string}`
  isConnected: boolean
  address?: string
  sponsored: boolean
  onStatusChange: (status: {
    chainId: number
    hasGmToday: boolean
    targetSec: number
  }) => void
  onOpenModal: (refetch: () => Promise<unknown>) => void
}) {
  const { stats, isReady } = useGmStats(address, chainId)

  const handleOpenModal = React.useCallback(
    (refetch: () => Promise<unknown>) => {
      onOpenModal(refetch)
    },
    [onOpenModal]
  )

  return (
    <GMChainCard
      chainId={chainId}
      name={chainName}
      contractAddress={contractAddress}
      isConnected={isConnected}
      address={address}
      onStatusChange={onStatusChange}
      sponsored={sponsored}
      stats={stats}
      isStatsReady={isReady}
      onOpenModal={handleOpenModal}
    />
  )
})
