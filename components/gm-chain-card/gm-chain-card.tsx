"use client"

import React, { useEffect, useMemo, useState } from "react"
import { type Address } from "viem"
import { useChainId, useReadContract } from "wagmi"
import { base, celo, optimism } from "wagmi/chains"

import { dailyGMAbi } from "@/lib/abi/daily-gm"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
} from "@/components/ui/item"
import { Icons } from "@/components/icons"

import { ActionButton } from "./action-button"
import { CountdownText } from "./countdown-text"
import { GMModal } from "./gm-modal"

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
}

export const GMChainCard = React.memo(function GMChainCard({
  chainId,
  name,
  contractAddress,
  isConnected,
  address,
  onStatusChange,
  sponsored = false,
}: GMChainCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [processing, setProcessing] = useState(false)
  const currentChainId = useChainId()
  const onCorrectChain = currentChainId === chainId

  // Fetch on-chain last GM day
  const {
    data: lastGmDayData,
    refetch: refetchLastGmDay,
    isPending: isPendingLastGm,
  } = useReadContract({
    chainId: chainId as typeof base.id | typeof celo.id | typeof optimism.id,
    abi: dailyGMAbi,
    address: contractAddress,
    functionName: "lastGMDay",
    args: address ? [address as Address] : undefined,
    query: { enabled: Boolean(address && contractAddress) },
  })

  // Compute GM state
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

  // Notify parent of status changes
  useEffect(() => {
    onStatusChange?.({ chainId, hasGmToday, targetSec })
  }, [chainId, hasGmToday, targetSec, onStatusChange])

  // Get chain-specific styling
  const chainBtnClasses = useMemo(
    () => getChainBtnClasses(chainId, name),
    [chainId, name]
  )

  const chainIconName = useMemo(
    () => getChainIconName(chainId, name),
    [chainId, name]
  )

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
          <ActionButton
            isConnected={isConnected}
            chainId={chainId}
            name={name}
            onCorrectChain={onCorrectChain}
            hasGmToday={hasGmToday}
            gmDisabled={gmDisabled}
            targetSec={targetSec}
            chainBtnClasses={chainBtnClasses}
            onOpenModal={() => setIsModalOpen(true)}
            renderCountdown={(sec: number) => <CountdownText targetSec={sec} />}
          />
        </ItemActions>
      </Item>

      <GMModal
        isOpen={isModalOpen}
        chainId={chainId}
        contractAddress={contractAddress}
        isSponsored={sponsored && chainId === 8453}
        isContractReady={Boolean(contractAddress)}
        processing={processing}
        chainBtnClasses={chainBtnClasses}
        address={address}
        refetchLastGmDay={refetchLastGmDay}
        onClose={() => setIsModalOpen(false)}
        setProcessing={setProcessing}
      />
    </>
  )
})
