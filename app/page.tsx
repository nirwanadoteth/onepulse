"use client"

import { useEffect, useState } from "react"
import { useMiniKit } from "@coinbase/onchainkit/minikit"
import { sdk } from "@farcaster/miniapp-sdk"
import { useTheme } from "next-themes"

import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"
import { Particles } from "@/components/ui/particles"
import { SparklesText } from "@/components/ui/sparkles-text"
import { GMBase } from "@/components/gm-base"
import { WalletComponents } from "@/components/wallet"

import { minikitConfig } from "../minikit.config"

export default function Home() {
  const { isFrameReady, setFrameReady, context } = useMiniKit()
  const { resolvedTheme } = useTheme()
  const [color, setColor] = useState("#ffffff")

  // Initialize the  miniapp
  useEffect(() => {
    setColor(resolvedTheme === "dark" ? "#ffffff" : "#0a0a0a")
    if (!isFrameReady) {
      setFrameReady()
    }
  }, [resolvedTheme, setFrameReady, isFrameReady])

  // GM UI moved into GMBase component

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
          <SparklesText className="text-2xl">
            {minikitConfig.miniapp.name}
          </SparklesText>
          <AnimatedThemeToggler />
          {/* Profile picture - only show if context data is available */}
          {context && context?.user?.pfpUrl ? (
            <button
              onClick={() => sdk.actions.viewProfile({ fid: context.user.fid })}
              className="shrink-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={context.user.pfpUrl}
                alt="Profile"
                className="h-8 w-8 rounded-full object-cover"
              />
              <p>{context?.user?.displayName}</p>
            </button>
          ) : (
            <WalletComponents />
          )}
        </div>
        <div>
          <div className="space-y-3">
            <GMBase />
          </div>
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
