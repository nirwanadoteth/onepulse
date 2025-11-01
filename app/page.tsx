"use client"

import { useEffect, useMemo, useState } from "react"
import { minikitConfig } from "@/minikit.config"
import { useAddFrame, useMiniKit, useIsInMiniApp } from "@coinbase/onchainkit/minikit"
import { Bookmark } from "lucide-react"
import { useTheme } from "next-themes"
import { useAccount } from "wagmi"

import { detectCoinbaseSmartWallet } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Particles } from "@/components/ui/particles"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GMBase } from "@/components/gm-base"
import { ModeToggle } from "@/components/mode-toggle"
import { Profile } from "@/components/profile"
import { DisconnectWallet } from "@/components/wallet"

export default function Home() {
  const addFrame = useAddFrame()
  const { isFrameReady, setFrameReady, context } = useMiniKit()
  const { isInMiniApp } = useIsInMiniApp()
  const { address, isConnected } = useAccount()
  const { resolvedTheme } = useTheme()
  const color = useMemo(
    () => (resolvedTheme === "dark" ? "#ffffff" : "#0a0a0a"),
    [resolvedTheme]
  )
  const [tab, setTab] = useState("home")
  const [isSmartWallet, setIsSmartWallet] = useState(false)
  const isBaseApp = context?.client?.clientFid === 309857

  // Detect Coinbase Smart Wallet after connected
  useEffect(() => {
    if (!isConnected || !address) return
    ;(async () => {
      const result = await detectCoinbaseSmartWallet(address as `0x${string}`)
      setIsSmartWallet(result)
    })()
  }, [isConnected, address])

  // Initialize the  miniapp
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady()
    }
  }, [setFrameReady, isFrameReady])

  const handleAddMiniApp = async () => {
    const result = await addFrame()
    if (result && context?.user.fid) {
      const targetFids = [context?.user.fid]
      const notification = {
        title: "Welcome to OnePulse",
        body: "Thank you for adding OnePulse",
        target_url: minikitConfig.miniapp.homeUrl,
      }
      const resp = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetFids, notification, filters: {} }),
      })
      const notify = await resp.json()

      if (notify.success) {
        console.log("Notification sent successfully:", notify.data)
      } else {
        console.error("Failed to send notification:", notify.error)
      }
    }
  }

  const safeAreaStyle = useMemo(
    () => ({
      marginTop: context?.client?.safeAreaInsets?.top ?? 0,
      marginBottom: context?.client?.safeAreaInsets?.bottom ?? 0,
      marginLeft: context?.client?.safeAreaInsets?.left ?? 0,
      marginRight: context?.client?.safeAreaInsets?.right ?? 0,
    }),
    [context?.client?.safeAreaInsets]
  )

  return (
    <div style={safeAreaStyle}>
      <div className="mx-auto w-[95%] max-w-lg px-4 py-4">
        <div className="mt-3 mb-6 flex items-center justify-between">
          <div className="justify-left text-2xl font-bold">
            {minikitConfig.miniapp.name}
          </div>
          <div>
            {!context?.client.added && isInMiniApp && (
              <Button
                variant={"outline"}
                size={"sm"}
                className="mr-2"
                onClick={handleAddMiniApp}
              >
                <Bookmark />
                Save
              </Button>
            )}
            <ModeToggle />
          </div>
        </div>
        <div className="mt-4 mb-6">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="bg-background border-border flex h-12 w-full gap-2 rounded-lg border">
              <TabsTrigger
                value="home"
                className="data-[state=active]:bg-accent"
              >
                Home
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                className="data-[state=active]:bg-accent"
              >
                Profile
              </TabsTrigger>
            </TabsList>
            <TabsContent value="home">
              <GMBase isSmartWallet={isSmartWallet} sponsored={isBaseApp} />
            </TabsContent>
            <TabsContent value="profile">
              <Profile
                isSmartWallet={isSmartWallet}
                user={
                  context?.user
                    ? {
                        fid: context.user.fid,
                        displayName: context.user.displayName ?? "",
                        username: context.user.username ?? "",
                        pfpUrl: context.user.pfpUrl,
                      }
                    : undefined
                }
                onDisconnected={() => setTab("home")}
              />
            </TabsContent>
          </Tabs>
        </div>
        {isConnected && !context?.user && (
          <div className="fixed inset-x-0 bottom-0 mx-auto w-[95%] max-w-lg p-4">
            <DisconnectWallet
              onDisconnected={() => tab === "profile" && setTab("home")}
            />
          </div>
        )}
      </div>
      <Particles
        className="absolute inset-0 z-0"
        quantity={100}
        ease={80}
        color={color}
        refresh
      />
    </div>
  )
}
