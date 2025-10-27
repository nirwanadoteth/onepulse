"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { ConnectWallet } from "@coinbase/onchainkit/wallet"
import {
  Transaction,
  TransactionButton,
  TransactionStatus,
  TransactionToast,
} from "@coinbase/onchainkit/transaction"
import { useQueryClient } from "@tanstack/react-query"
import { isAddress } from "viem"
import { useAccount, useReadContract } from "wagmi"

import { dailyGMAbi } from "@/lib/abi/dailyGM"
import { DAILY_GM_ADDRESS } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
} from "@/components/ui/item"
import { MagicCard } from "@/components/ui/magic-card"
import { ShinyButton } from "@/components/ui/shiny-button"

export function GMBase() {
  const { isConnected, address } = useAccount()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<"main" | "gmTo">("main")
  const [recipient, setRecipient] = useState("")

  const isContractReady = Boolean(DAILY_GM_ADDRESS && DAILY_GM_ADDRESS !== "")
  const isRecipientValid = recipient !== "" && isAddress(recipient)

  // Onchain: lastGMDay(address)
  const {
    data: lastGmDayData,
    refetch: refetchLastGmDay,
    isPending: isPendingLastGm,
  } = useReadContract({
    abi: dailyGMAbi,
    address: DAILY_GM_ADDRESS as `0x${string}`,
    functionName: "lastGMDay",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && isContractReady) },
  })

  // Compute CTA state and countdown target
  const { hasGmToday, gmDisabled, ctaText, targetSec } = useMemo(() => {
    if (!address || !isContractReady) {
      return {
        hasGmToday: false,
        gmDisabled: !isConnected || !isContractReady,
        ctaText: isConnected ? "GM on Base" : "Connect wallet to GM",
        targetSec: 0,
      }
    }
    if (lastGmDayData === undefined) {
      return {
        hasGmToday: false,
        gmDisabled: true,
        ctaText: "Checking…",
        targetSec: 0,
      }
    }
    const lastDay = Number((lastGmDayData as unknown as bigint) ?? 0n)
    const nowSec = Math.floor(Date.now() / 1000)
    const currentDay = Math.floor(nowSec / 86400)
    const already = lastDay >= currentDay
    const nextDayStartSec = (currentDay + 1) * 86400
    return {
      hasGmToday: already,
      gmDisabled: already || isPendingLastGm,
      ctaText: already ? "GM in --:--:--" : "GM on Base",
      targetSec: nextDayStartSec,
    }
  }, [address, isContractReady, isConnected, lastGmDayData, isPendingLastGm])

  // Live countdown if already GM'd today
  const [countdown, setCountdown] = useState("--:--:--")
  useEffect(() => {
    if (!hasGmToday || !targetSec) return
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
      const ms = (targetSec - nowSec) * 1000
      setCountdown(fmt(ms))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [hasGmToday, targetSec])

  const close = () => {
    setOpen(false)
    setMode("main")
    setRecipient("")
  }

  function SuccessReporter({
    status,
    onReported,
  }: {
    status: string
    onReported?: () => void
  }) {
    const didReport = useRef(false)
    const queryClient = useQueryClient()
    useEffect(() => {
      const report = async () => {
        if (didReport.current) return
        if (!address) return
        try {
          await fetch("/api/gm/report", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ address }),
          })
        } catch {}
        // Refresh cached stats for this address
        try {
          if (address) {
            await queryClient.invalidateQueries({
              queryKey: ["gm-stats", address],
            })
          }
        } catch {}
        // Update onchain lastGMDay so CTA refreshes
        try {
          await refetchLastGmDay()
        } catch {}
        didReport.current = true
        onReported?.()
      }
      if (status === "success") {
        void report()
      }
    }, [status])
    return null
  }

  return (
    <div className="mt-4 space-y-4">
      <Item variant="outline">
        <ItemContent>
          <ItemMedia>
            <Image
              src="/basemark.png"
              alt="Base"
              width={96}
              height={32}
              className="h-8 object-contain"
            />
          </ItemMedia>
          <ItemDescription>Boost your Base onchain footprint.</ItemDescription>
        </ItemContent>
        <ItemActions>
          {isConnected ? (
            <ShinyButton
              disabled={gmDisabled}
              onClick={() => {
                if (!gmDisabled) setOpen(true)
              }}
            >
              {hasGmToday ? `GM in ${countdown}` : ctaText}
            </ShinyButton>
          ) : (
            <ConnectWallet>Connect Wallet</ConnectWallet>
          )}
        </ItemActions>
      </Item>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={close} />
          <MagicCard
            className="relative z-10 w-full max-w-sm rounded-2xl p-4"
            gradientFrom="#0052FF"
            gradientTo="#80B3FF"
            gradientColor="rgba(0,82,255,0.15)"
          >
            {mode === "main" ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Choose GM Type</h3>
                <div className="grid gap-3">
                  {/* GM */}
                  {isConnected ? (
                    <Transaction
                      calls={[
                        {
                          abi: dailyGMAbi,
                          address: DAILY_GM_ADDRESS as `0x${string}`,
                          functionName: "gm",
                        },
                      ]}
                    >
                      <TransactionButton
                        disabled={!isContractReady}
                        render={({ onSubmit, isDisabled, status }) => (
                          <>
                            <Button
                              onClick={onSubmit}
                              disabled={isDisabled}
                              className="w-full"
                            >
                              {status === "pending" ? "Processing..." : "GM"}
                            </Button>
                            <SuccessReporter
                              status={String(status)}
                              onReported={close}
                            />
                          </>
                        )}
                      />
                      <TransactionStatus />
                      <TransactionToast />
                    </Transaction>
                  ) : (
                    <Button disabled className="w-full">
                      Connect wallet to GM
                    </Button>
                  )}

                  {/* GM to a Fren */}
                  <Button
                    disabled={!isConnected || !isContractReady}
                    onClick={() => setMode("gmTo")}
                    className="w-full"
                  >
                    GM to a Fren
                  </Button>

                  {/* Cancel */}
                  <Button variant="outline" onClick={close} className="w-full">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Fren&#39;s Address</h3>
                <input
                  type="text"
                  placeholder="0x..."
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full rounded-md border bg-transparent px-3 py-2"
                />
                {recipient && !isRecipientValid && (
                  <p className="text-sm text-red-500">Enter a valid address.</p>
                )}
                <div className="grid gap-3">
                  {isConnected ? (
                    <Transaction
                      calls={[
                        {
                          abi: dailyGMAbi,
                          address: DAILY_GM_ADDRESS as `0x${string}`,
                          functionName: "gmTo",
                          args: [recipient as `0x${string}`],
                        },
                      ]}
                    >
                      <TransactionButton
                        disabled={!isRecipientValid || !isContractReady}
                        render={({ onSubmit, isDisabled, status }) => (
                          <>
                            <Button
                              onClick={onSubmit}
                              disabled={isDisabled}
                              className="w-full"
                            >
                              {status === "pending" ? "Sending..." : "Send GM"}
                            </Button>
                            <SuccessReporter
                              status={String(status)}
                              onReported={close}
                            />
                          </>
                        )}
                      />
                      <TransactionStatus />
                      <TransactionToast />
                    </Transaction>
                  ) : (
                    <Button disabled className="w-full">
                      Connect wallet to send
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setMode("main")}
                    className="w-full"
                  >
                    Back
                  </Button>
                </div>
              </div>
            )}
          </MagicCard>
        </div>
      )}
    </div>
  )
}
