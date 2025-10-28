"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import {
  Transaction,
  TransactionButton,
} from "@coinbase/onchainkit/transaction"
import { ConnectWallet } from "@coinbase/onchainkit/wallet"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
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
import { Spinner } from "@/components/ui/spinner"

export function GMBase() {
  const { isConnected, address } = useAccount()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<"main" | "gmTo">("main")
  const [recipient, setRecipient] = useState("")
  const [processing, setProcessing] = useState(false)

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

  const close = useCallback(() => {
    setOpen(false)
    setMode("main")
    setRecipient("")
    setProcessing(false)
  }, [])

  function SuccessReporter({
    status,
    onReported,
    message,
    txHash,
    address: addressProp,
    refetchLastGmDay: refetchLastGmDayProp,
  }: {
    status: string
    onReported?: () => void
    message?: string
    txHash?: string
    address?: string
    refetchLastGmDay?: () => Promise<unknown>
  }) {
    const didReport = useRef(false)
    const queryClient = useQueryClient()
    useEffect(() => {
      const report = async () => {
        if (didReport.current) return
        // Mark early to avoid duplicate toasts if effect re-runs
        didReport.current = true
        // Toast success once with optional "View tx" action
        try {
          const url = txHash ? `https://basescan.org/tx/${txHash}` : undefined
          const toastId = txHash
            ? `gm-success-${txHash}`
            : addressProp
              ? `gm-success-${addressProp}`
              : `gm-success`
          toast.success(message ?? "GM successful", {
            id: toastId,
            duration: 3000,
            ...(url
              ? {
                  action: {
                    label: "View tx",
                    onClick: () =>
                      window.open(url, "_blank", "noopener,noreferrer"),
                  },
                }
              : {}),
          })
        } catch {}
        // Report only if we have an address
        if (addressProp) {
          try {
            await fetch("/api/gm/report", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ address: addressProp }),
            })
          } catch {}
        }
        // Refresh cached stats for this address
        try {
          if (addressProp) {
            await queryClient.invalidateQueries({
              queryKey: ["gm-stats", addressProp],
            })
          }
        } catch {}
        // Update onchain lastGMDay so CTA refreshes
        try {
          await refetchLastGmDayProp?.()
        } catch {}
        onReported?.()
      }
      if (status === "success") {
        void report()
      }
    }, [
      status,
      addressProp,
      onReported,
      queryClient,
      refetchLastGmDayProp,
      txHash,
      message,
    ])
    return null
  }

  function ErrorReporter({
    status,
    message,
    onRetry,
  }: {
    status: string
    message?: string
    onRetry?: () => void
  }) {
    const didToast = useRef(false)
    useEffect(() => {
      if (status === "error" && !didToast.current) {
        // Mark early to avoid duplicates
        didToast.current = true
        toast.error(message ?? "Transaction canceled", {
          id: `gm-error-${address ?? "unknown"}`,
          duration: 5000,
          ...(onRetry
            ? {
                action: {
                  label: "Try again",
                  onClick: () => onRetry?.(),
                },
              }
            : {}),
        })
      }
    }, [status, message, onRetry])
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
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              if (!processing) close()
            }}
          />
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
                      render={({
                        onSubmit,
                        isDisabled,
                        status,
                        context,
                      }: {
                        onSubmit: () => void
                        isDisabled: boolean
                        status: "default" | "success" | "error" | "pending"
                        context?: {
                          transactionHash?: string
                          receipt?: { transactionHash?: string }
                          transactionReceipts?: Array<{
                            transactionHash?: string
                          }>
                        }
                      }) => {
                        const txHash =
                          context?.transactionHash ||
                          context?.receipt?.transactionHash ||
                          context?.transactionReceipts?.[0]?.transactionHash
                        return (
                          <>
                            <ProcessingMirror
                              status={String(status)}
                              onChange={setProcessing}
                            />
                            <Button
                              onClick={onSubmit}
                              disabled={isDisabled}
                              className="w-full"
                            >
                              {status === "pending" ? (
                                <>
                                  <Spinner />
                                  Processing...
                                </>
                              ) : (
                                "GM"
                              )}
                            </Button>
                            <SuccessReporter
                              status={String(status)}
                              onReported={close}
                              message="GM sent successfully"
                              txHash={txHash}
                              address={address}
                              refetchLastGmDay={refetchLastGmDay}
                            />
                            <ErrorReporter
                              status={String(status)}
                              message="Transaction canceled"
                              onRetry={onSubmit}
                            />
                          </>
                        )
                      }}
                    />
                  </Transaction>

                  <Button
                    disabled={!isContractReady || processing}
                    onClick={() => setMode("gmTo")}
                    className="w-full"
                  >
                    GM to a Fren
                  </Button>

                  <Button
                    variant="outline"
                    onClick={close}
                    className="w-full"
                    disabled={processing}
                  >
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
                  disabled={processing}
                  className="w-full rounded-md border bg-transparent px-3 py-2"
                />
                {recipient && !isRecipientValid && (
                  <p className="text-sm text-red-500">Enter a valid address.</p>
                )}
                <div className="grid gap-3">
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
                      disabled={
                        !isRecipientValid || !isContractReady || processing
                      }
                      render={({
                        onSubmit,
                        isDisabled,
                        status,
                        context,
                      }: {
                        onSubmit: () => void
                        isDisabled: boolean
                        status: "default" | "success" | "error" | "pending"
                        context?: {
                          transactionHash?: string
                          receipt?: { transactionHash?: string }
                          transactionReceipts?: Array<{
                            transactionHash?: string
                          }>
                        }
                      }) => {
                        const txHash =
                          context?.transactionHash ||
                          context?.receipt?.transactionHash ||
                          context?.transactionReceipts?.[0]?.transactionHash
                        return (
                          <>
                            <ProcessingMirror
                              status={String(status)}
                              onChange={setProcessing}
                            />
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
                              message={
                                recipient
                                  ? `GM sent to ${recipient.slice(0, 6)}...${recipient.slice(-4)}`
                                  : "GM sent successfully"
                              }
                              txHash={txHash}
                              address={address}
                              refetchLastGmDay={refetchLastGmDay}
                            />
                            <ErrorReporter
                              status={String(status)}
                              message="Transaction canceled"
                              onRetry={onSubmit}
                            />
                          </>
                        )
                      }}
                    />
                  </Transaction>
                  <Button
                    variant="outline"
                    onClick={() => setMode("main")}
                    disabled={processing}
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

function ProcessingMirror({
  status,
  onChange,
}: {
  status: string
  onChange: (pending: boolean) => void
}) {
  useEffect(() => {
    onChange(status === "pending")
  }, [status, onChange])
  return null
}
