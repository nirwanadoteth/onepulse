"use client"

import { useEffect, useState } from "react"
import { useMiniKit } from "@coinbase/onchainkit/minikit"
import { WalletIsland } from "@coinbase/onchainkit/wallet"
import { useTheme } from "next-themes"

import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"
import { Particles } from "@/components/ui/particles"
import { SparklesText } from "@/components/ui/sparkles-text"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GMBase } from "@/components/gm-base"
import { Profile, type MiniAppUser } from "@/components/profile"

import { minikitConfig } from "../minikit.config"

export default function Home() {
  const { isFrameReady, setFrameReady, context } = useMiniKit()
  const { resolvedTheme } = useTheme()
  const [color, setColor] = useState("#ffffff")
  const [tab, setTab] = useState("home")

  // Initialize the  miniapp
  useEffect(() => {
    setColor(resolvedTheme === "dark" ? "#ffffff" : "#0a0a0a")
    if (!isFrameReady) {
      setFrameReady()
    }
  }, [resolvedTheme, setFrameReady, isFrameReady])

  return (
    <div
      style={{
        marginTop: context?.client?.safeAreaInsets?.top ?? 0,
        marginBottom: context?.client?.safeAreaInsets?.bottom ?? 0,
        marginLeft: context?.client?.safeAreaInsets?.left ?? 0,
        marginRight: context?.client?.safeAreaInsets?.right ?? 0,
      }}
    >
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
              <GMBase />
            </TabsContent>
            <TabsContent value="profile">
              <Profile
                user={context?.user as unknown as MiniAppUser}
                onDisconnected={() => setTab("home")}
              />
            </TabsContent>
          </Tabs>
        </div>
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
