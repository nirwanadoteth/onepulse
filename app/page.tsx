"use client"

import { useEffect, useMemo, useState } from "react"
import { minikitConfig } from "@/minikit.config"
import { useMiniKit } from "@coinbase/onchainkit/minikit"
import { isWalletACoinbaseSmartWallet } from "@coinbase/onchainkit/wallet"
import { useTheme } from "next-themes"
import {
  createPublicClient,
  http,
  type PublicClient,
  type RpcUserOperation,
} from "viem"
import { base } from "viem/chains"
import { useAccount } from "wagmi"

import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"
import { Particles } from "@/components/ui/particles"
import { SparklesText } from "@/components/ui/sparkles-text"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GMBase } from "@/components/gm-base"
import { Profile } from "@/components/profile"
import { DisconnectWallet } from "@/components/wallet"

const publicClient = createPublicClient({
  chain: base,
  transport: http(),
})

export default function Home() {
  const { isFrameReady, setFrameReady, context } = useMiniKit()
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
    const userOperation = { sender: address } as RpcUserOperation<"0.6">
    ;(async () => {
      try {
        const res = await isWalletACoinbaseSmartWallet({
          client: publicClient as PublicClient,
          userOp: userOperation,
        })
        setIsSmartWallet(res.isCoinbaseSmartWallet === true)
      } catch {
        setIsSmartWallet(false)
      }
    })()
  }, [isConnected, address])

  // Initialize the  miniapp
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady()
    }
  }, [setFrameReady, isFrameReady])

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
          <SparklesText className="justify-left text-2xl">
            {minikitConfig.miniapp.name}
          </SparklesText>
          <AnimatedThemeToggler />
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
