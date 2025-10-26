"use client"

import { useState } from "react"
import Image from "next/image"
import {
  Transaction,
  TransactionButton,
  TransactionStatus,
  TransactionToast,
} from "@coinbase/onchainkit/transaction"
import { isAddress } from "viem"
import { useAccount } from "wagmi"

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
  const { isConnected } = useAccount()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<"main" | "gmTo">("main")
  const [recipient, setRecipient] = useState("")

  const isContractReady = Boolean(DAILY_GM_ADDRESS && DAILY_GM_ADDRESS !== "")
  const isRecipientValid = recipient !== "" && isAddress(recipient)

  const close = () => {
    setOpen(false)
    setMode("main")
    setRecipient("")
  }

  return (
    <div>
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
          <ItemDescription>
            Send GM, build streaks, and grow your onchain footprint on Base.
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <ShinyButton onClick={() => setOpen(true)}>GM on Base</ShinyButton>
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
                          <Button
                            onClick={onSubmit}
                            disabled={isDisabled}
                            className="w-full"
                          >
                            {status === "pending" ? "Processing..." : "GM"}
                          </Button>
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
                          <Button
                            onClick={onSubmit}
                            disabled={isDisabled}
                            className="w-full"
                          >
                            {status === "pending" ? "Sending..." : "Send GM"}
                          </Button>
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
