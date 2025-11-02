"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useAddress } from "@coinbase/onchainkit/identity"
import {
  Transaction,
  TransactionButton,
  TransactionSponsor,
} from "@coinbase/onchainkit/transaction"
import { useQueryClient } from "@tanstack/react-query"
import { isAddress, type Address } from "viem"
import { useChainId, useReadContract, useSwitchChain } from "wagmi"
import { base, celo, optimism } from "wagmi/chains"

import { dailyGMAbi } from "@/lib/abi/daily-gm"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
} from "@/components/ui/item"
import { Spinner } from "@/components/ui/spinner"
import { Icons } from "@/components/icons"
import { TransactionToast } from "@/components/transaction-toast"
import { ConnectWallet } from "@/components/wallet"

type TransactionStatus = "default" | "success" | "error" | "pending"

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
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<"main" | "gmTo">("main")
  const [recipient, setRecipient] = useState("")
  const [processing, setProcessing] = useState(false)
  const currentChainId = useChainId()
  const { switchChain, isPending: isSwitching } = useSwitchChain()
  const onCorrectChain = currentChainId === chainId
  const isCelo = name.toLowerCase() === "celo" || chainId === 42220
  const isOptimism = name.toLowerCase() === "optimism" || chainId === 10
  const chainBtnClasses = isCelo
    ? "bg-[#FCFF52] text-black hover:bg-[#FCFF52]/90 dark:bg-[#476520] dark:text-white dark:hover:bg-[#476520]/90"
    : isOptimism
      ? "bg-[#ff0420] text-white hover:bg-[#ff0420]/90"
      : "bg-[#0052ff] text-white hover:bg-[#0052ff]/90"

  const isContractReady = Boolean(contractAddress)
  const sanitizedRecipient = useMemo(() => recipient.trim(), [recipient])
  const isRecipientValid =
    sanitizedRecipient !== "" && isAddress(sanitizedRecipient)

  // Onchain: lastGMDay(address) on this chain
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
    query: { enabled: Boolean(address && isContractReady) },
  })

  // Compute CTA state and countdown target
  const { hasGmToday, gmDisabled, ctaText, targetSec } = useMemo(() => {
    if (!address || !isContractReady) {
      return {
        hasGmToday: false,
        gmDisabled: !isConnected || !isContractReady,
        ctaText: isConnected ? `GM on ${name}` : "Connect wallet to GM",
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
    const lastDay = Number((lastGmDayData as bigint) ?? 0n)
    const nowSec = Math.floor(Date.now() / 1000)
    const currentDay = Math.floor(nowSec / 86400)
    const already = lastDay >= currentDay
    const nextDayStartSec = (currentDay + 1) * 86400
    return {
      hasGmToday: already,
      gmDisabled: already || isPendingLastGm,
      ctaText: already ? "GM in --:--:--" : `GM on ${name}`,
      targetSec: nextDayStartSec,
    }
  }, [
    address,
    isContractReady,
    isConnected,
    lastGmDayData,
    isPendingLastGm,
    name,
  ])

  // Report status up to parent (for global "all done" logic)
  const notifyStatus = useCallback(() => {
    onStatusChange?.({ chainId, hasGmToday, targetSec })
  }, [onStatusChange, chainId, hasGmToday, targetSec])

  useEffect(() => {
    notifyStatus()
  }, [notifyStatus])

  // Countdown moved into a lightweight child to avoid re-rendering the whole card every second

  const close = useCallback(() => {
    setOpen(false)
    setMode("main")
    setRecipient("")
    setProcessing(false)
  }, [])

  // Name resolution: resolve ENS or Basename to an address before sending gmTo
  const isName = sanitizedRecipient !== "" && !isAddress(sanitizedRecipient)

  const { data: resolvedAddress, isFetching: isResolving } = useAddress(
    { name: sanitizedRecipient },
    { enabled: isName }
  )

  const finalRecipient =
    resolvedAddress ?? (isRecipientValid ? sanitizedRecipient : undefined)

  // Focus trap helpers for the modal dialog
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const lastActiveRef = useRef<HTMLElement | null>(null)

  const getFocusableElements = useCallback((container: HTMLElement) => {
    const selectors = [
      "a[href]",
      "button:not([disabled])",
      "textarea:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      '[tabindex]:not([tabindex="-1"])',
    ].join(",")
    const nodes = Array.from(container.querySelectorAll<HTMLElement>(selectors))
    return nodes.filter((el) => {
      const style = window.getComputedStyle(el)
      const notHidden =
        style.visibility !== "hidden" && style.display !== "none"
      const notAriaHidden = el.getAttribute("aria-hidden") !== "true"
      return notHidden && notAriaHidden && !el.hasAttribute("disabled")
    })
  }, [])

  useEffect(() => {
    if (!open) return
    const container = dialogRef.current
    if (!container) return

    // Save previously focused element
    lastActiveRef.current = (document.activeElement as HTMLElement) ?? null

    // Set initial focus
    const focusables = getFocusableElements(container)
    const target = focusables[0] ?? container
    ;(target as HTMLElement).focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (!processing) {
          e.preventDefault()
          close()
        }
        return
      }
      if (e.key !== "Tab") return
      const list = getFocusableElements(container)
      if (list.length === 0) {
        e.preventDefault()
        ;(container as HTMLElement).focus()
        return
      }
      const first = list[0]
      const last = list[list.length - 1]
      const active = (document.activeElement as HTMLElement) ?? null
      const isShift = e.shiftKey
      if (isShift) {
        if (!active || active === first || !container.contains(active)) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (!active || active === last || !container.contains(active)) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    container.addEventListener("keydown", handleKeyDown)
    return () => {
      container.removeEventListener("keydown", handleKeyDown)
      const prev = lastActiveRef.current
      if (prev && typeof prev.focus === "function") {
        prev.focus()
      }
    }
  }, [open, close, getFocusableElements, processing])

  // Prevent background scroll when modal is open (mobile friendly)
  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [open])

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
        didReport.current = true
        if (addressProp) {
          try {
            await fetch("/api/gm/report", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ address: addressProp, chainId }),
            })
          } catch {}
        }
        try {
          if (addressProp) {
            await queryClient.invalidateQueries({
              queryKey: ["gm-stats", addressProp],
            })
          }
        } catch {}
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

  return (
    <Item variant="outline">
      <ItemContent>
        <ItemMedia>
          {(() => {
            const lower = name.toLowerCase()
            const Svg =
              lower === "celo"
                ? Icons.celo
                : lower === "optimism"
                  ? Icons.optimism
                  : Icons.base
            return (
              <Svg
                className="h-8 w-24 text-current"
                role="img"
                aria-label={`${name} wordmark`}
                focusable={false}
              />
            )
          })()}
        </ItemMedia>
        <ItemDescription>Amplify your {name} GM</ItemDescription>
      </ItemContent>
      <ItemActions>
        {!isConnected ? (
          <ConnectWallet size="lg" className={`w-40 ${chainBtnClasses}`} />
        ) : !onCorrectChain ? (
          hasGmToday ? (
            <Button size="lg" className={`w-40 ${chainBtnClasses}`} disabled>
              <CountdownText targetSec={targetSec} />
            </Button>
          ) : (
            <Button
              size="lg"
              className={`w-40 ${chainBtnClasses}`}
              onClick={async () => {
                try {
                  await switchChain({
                    chainId: chainId as
                      | typeof base.id
                      | typeof celo.id
                      | typeof optimism.id,
                  })
                } catch (e) {
                  console.error("Failed to switch chain", e)
                }
              }}
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
        ) : (
          <Button
            size="lg"
            className={`w-40 ${chainBtnClasses}`}
            disabled={gmDisabled}
            onClick={() => {
              if (!gmDisabled) setOpen(true)
            }}
          >
            {hasGmToday ? <CountdownText targetSec={targetSec} /> : ctaText}
          </Button>
        )}
      </ItemActions>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`gm-dialog-title-${chainId}`}
          ref={dialogRef}
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              if (!processing) close()
            }}
          />
          <Card className="relative z-10 w-[95%] max-w-sm" tabIndex={-1}>
            {mode === "main" ? (
              <>
                <CardHeader>
                  <CardTitle
                    id={`gm-dialog-title-${chainId}`}
                    className="text-center text-lg"
                  >
                    Choose GM Type
                  </CardTitle>
                </CardHeader>
                <CardFooter className="flex-col gap-2">
                  <Transaction
                    isSponsored={sponsored}
                    chainId={chainId}
                    calls={[
                      {
                        abi: dailyGMAbi,
                        address: contractAddress,
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
                        status: TransactionStatus
                        context?: {
                          chainId?: number
                          transactionHash?: string
                          receipt?: { transactionHash?: string }
                          transactionReceipts?: Array<{
                            transactionHash?: string
                          }>
                        }
                        error?: Error | null
                      }) => {
                        const txHash =
                          context?.transactionHash ||
                          context?.receipt?.transactionHash ||
                          context?.transactionReceipts?.[0]?.transactionHash
                        return (
                          <>
                            <ProcessingMirror
                              status={status}
                              onChange={setProcessing}
                            />
                            <Button
                              onClick={onSubmit}
                              disabled={isDisabled}
                              className={`w-full ${chainBtnClasses}`}
                              aria-busy={status === "pending"}
                              autoFocus
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
                          </>
                        )
                      }}
                    />
                    {sponsored && <TransactionSponsor />}
                    <TransactionToast />
                  </Transaction>

                  <Button
                    disabled={!isContractReady || processing}
                    onClick={() => setMode("gmTo")}
                    className={`w-full ${chainBtnClasses}`}
                    aria-disabled={!isContractReady || processing}
                  >
                    GM to a Fren
                  </Button>

                  <Button
                    variant="outline"
                    onClick={close}
                    className="w-full"
                    disabled={processing}
                    aria-disabled={processing}
                  >
                    Cancel
                  </Button>
                </CardFooter>
              </>
            ) : (
              <>
                <CardHeader>
                  <CardTitle
                    id={`gm-dialog-title-${chainId}`}
                    className="text-center text-lg"
                  >
                    Fren&#39;s Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <input
                    type="text"
                    placeholder="0x... or nirwana.eth"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    disabled={processing}
                    className="w-full rounded-md border bg-transparent px-3 py-2"
                    aria-label="Recipient wallet address"
                    aria-invalid={
                      sanitizedRecipient !== "" &&
                      !isRecipientValid &&
                      !resolvedAddress &&
                      !isResolving
                    }
                    aria-describedby={
                      sanitizedRecipient !== "" &&
                      !isRecipientValid &&
                      !resolvedAddress &&
                      !isResolving
                        ? "recipient-error"
                        : undefined
                    }
                    aria-busy={isResolving}
                    autoComplete="off"
                    spellCheck={false}
                    autoCapitalize="none"
                    autoCorrect="off"
                    inputMode="text"
                    autoFocus
                  />
                  {sanitizedRecipient &&
                    !isRecipientValid &&
                    !resolvedAddress &&
                    !isResolving && (
                      <p
                        id="recipient-error"
                        className="text-sm text-red-500"
                        role="alert"
                      >
                        Enter a valid address.
                      </p>
                    )}
                </CardContent>
                <CardFooter className="flex-col gap-2">
                  {finalRecipient ? (
                    <Transaction
                      isSponsored={sponsored}
                      chainId={chainId}
                      calls={[
                        {
                          abi: dailyGMAbi,
                          address: contractAddress,
                          functionName: "gmTo",
                          args: [finalRecipient as `0x${string}`],
                        },
                      ]}
                    >
                      <TransactionButton
                        disabled={
                          !finalRecipient || !isContractReady || processing
                        }
                        render={({
                          onSubmit,
                          isDisabled,
                          status,
                          context,
                        }: {
                          onSubmit: () => void
                          isDisabled: boolean
                          status: TransactionStatus
                          context?: {
                            transactionHash?: string
                            receipt?: { transactionHash?: string }
                            transactionReceipts?: Array<{
                              transactionHash?: string
                            }>
                          }
                          error?: Error | null
                        }) => {
                          const txHash =
                            context?.transactionHash ||
                            context?.receipt?.transactionHash ||
                            context?.transactionReceipts?.[0]?.transactionHash
                          return (
                            <>
                              <ProcessingMirror
                                status={status}
                                onChange={setProcessing}
                              />
                              <Button
                                onClick={onSubmit}
                                disabled={isDisabled}
                                className={`w-full ${chainBtnClasses}`}
                                aria-busy={status === "pending"}
                              >
                                {status === "pending"
                                  ? "Sending..."
                                  : "Send GM"}
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
                            </>
                          )
                        }}
                      />
                      {sponsored && <TransactionSponsor />}
                      <TransactionToast />
                    </Transaction>
                  ) : (
                    <Button
                      disabled={
                        !sanitizedRecipient ||
                        isResolving ||
                        !isContractReady ||
                        processing
                      }
                      className={`w-full ${chainBtnClasses}`}
                    >
                      {isResolving
                        ? "Resolving…"
                        : "Enter a valid address or ENS"}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setMode("main")}
                    disabled={processing}
                    className="w-full"
                    aria-disabled={processing}
                  >
                    Back
                  </Button>
                </CardFooter>
              </>
            )}
          </Card>
        </div>
      )}
    </Item>
  )
})

const ProcessingMirror = React.memo(function ProcessingMirror({
  status,
  onChange,
}: {
  status: TransactionStatus
  onChange: (pending: boolean) => void
}) {
  useEffect(() => {
    onChange(status === "pending")
  }, [status, onChange])
  return null
})

// Lightweight countdown display to minimize parent re-renders
const CountdownText = React.memo(function CountdownText({
  targetSec,
}: {
  targetSec: number
}) {
  const [text, setText] = useState("GM in --:--:--")
  const rafRef = useRef<number | null>(null)
  const intervalRef = useRef<number | null>(null)

  const format = useCallback((ms: number) => {
    const total = Math.max(0, Math.floor(ms / 1000))
    const h = Math.floor(total / 3600)
    const m = Math.floor((total % 3600) / 60)
    const s = total % 60
    const pad = (n: number) => String(n).padStart(2, "0")
    return `GM in ${pad(h)}:${pad(m)}:${pad(s)}`
  }, [])

  useEffect(() => {
    const update = () => {
      const nowSec = Math.floor(Date.now() / 1000)
      const ms = Math.max(0, (targetSec - nowSec) * 1000)
      setText(format(ms))
    }
    // Align the first paint, then tick every second
    rafRef.current = window.requestAnimationFrame(() => update())
    intervalRef.current = window.setInterval(update, 1000)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [targetSec, format])

  return <>{text}</>
})
