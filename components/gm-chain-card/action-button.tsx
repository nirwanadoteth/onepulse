"use client"

import React, { useCallback } from "react"
import { useSwitchChain } from "wagmi"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { ConnectWallet } from "@/components/wallet"

interface ActionButtonProps {
  isConnected: boolean
  chainId: number
  name: string
  onCorrectChain: boolean
  hasGmToday: boolean
  gmDisabled: boolean
  targetSec: number
  chainBtnClasses: string
  onOpenModal: () => void
  renderCountdown: (targetSec: number) => React.ReactNode
}

export const ActionButton = React.memo(function ActionButton({
  isConnected,
  chainId,
  name,
  onCorrectChain,
  hasGmToday,
  gmDisabled,
  targetSec,
  chainBtnClasses,
  onOpenModal,
  renderCountdown,
}: ActionButtonProps) {
  const { switchChain, isPending: isSwitching } = useSwitchChain()

  const handleSwitchChain = useCallback(() => {
    try {
      switchChain({
        chainId: chainId as 10 | 8453 | 42220,
      })
    } catch (e) {
      console.error("Failed to switch chain", e)
    }
  }, [switchChain, chainId])

  const handleOpenModal = useCallback(() => {
    if (!gmDisabled) onOpenModal()
  }, [gmDisabled, onOpenModal]) // ✓ Dependencies are stable and necessary

  // User not connected
  if (!isConnected) {
    return <ConnectWallet size="lg" className={`w-full ${chainBtnClasses}`} />
  }

  // User on wrong chain
  if (!onCorrectChain) {
    if (hasGmToday) {
      return (
        <Button size="lg" className={`w-full ${chainBtnClasses}`} disabled>
          {renderCountdown(targetSec)}
        </Button>
      )
    }

    return (
      <Button
        size="lg"
        className={`w-full ${chainBtnClasses}`}
        onClick={handleSwitchChain}
        disabled={isSwitching}
        aria-busy={isSwitching}
      >
        {isSwitching ? (
          <>
            <Spinner /> Switching…
          </>
        ) : (
          `Switch to ${name}`
        )}
      </Button>
    )
  }

  // User on correct chain - show main action
  return (
    <Button
      size="lg"
      className={`w-full ${chainBtnClasses}`}
      disabled={gmDisabled}
      onClick={handleOpenModal}
    >
      {hasGmToday ? renderCountdown(targetSec) : "GM on " + name}
    </Button>
  )
})
