"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react"
import dynamic from "next/dynamic"
import { minikitConfig } from "@/minikit.config"
import { useMiniKit } from "@coinbase/onchainkit/minikit"
import { sdk } from "@farcaster/miniapp-sdk"
import { Bookmark } from "lucide-react"
import { useReducedMotion } from "motion/react"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { useAccount } from "wagmi"

import { detectCoinbaseSmartWallet } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GMBase } from "@/components/gm-base"
import { ModeToggle } from "@/components/mode-toggle"
import { OnboardingModal } from "@/components/onboarding-modal"
import { Profile } from "@/components/profile"
import { DisconnectWallet } from "@/components/wallet"

const Particles = dynamic(
  () =>
    import("@/components/ui/particles").then((mod) => ({
      default: mod.Particles,
    })),
  { ssr: false, loading: () => null }
)

// SSR-safe onboarding visibility store using useSyncExternalStore
const ONBOARDING_KEY = "onepulse:onboarded"
const onboardingLocalListeners = new Set<() => void>()
function subscribeOnboarding(listener: () => void) {
  if (typeof window !== "undefined") {
    window.addEventListener("storage", listener)
  }
  onboardingLocalListeners.add(listener)
  return () => {
    onboardingLocalListeners.delete(listener)
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", listener)
    }
  }
}
function getOnboardingSnapshot() {
  try {
    if (typeof window === "undefined") return false
    return !window.localStorage.getItem(ONBOARDING_KEY)
  } catch {
    return false
  }
}
function getOnboardingServerSnapshot() {
  return false
}

export default function Home() {
  const { isFrameReady, setFrameReady, context } = useMiniKit()
  const { address, isConnected } = useAccount()
  const { resolvedTheme } = useTheme()
  const prefersReducedMotion = useReducedMotion()
  const color = useMemo(
    () => (resolvedTheme === "dark" ? "#ffffff" : "#0a0a0a"),
    [resolvedTheme]
  )
  const [tab, setTab] = useState("home")
  const [isSmartWallet, setIsSmartWallet] = useState(false)
  const [inMiniApp, setInMiniApp] = useState(false)
  const [showParticles, setShowParticles] = useState(false)
  const showOnboarding = useSyncExternalStore(
    subscribeOnboarding,
    getOnboardingSnapshot,
    getOnboardingServerSnapshot
  )
  const isBaseApp = context?.client?.clientFid === 309857
  const isFarcaster = context?.client?.clientFid === 1

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

  // Detect if running inside a Farcaster Mini App (per docs)
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const result = await sdk.isInMiniApp()
        if (!cancelled) setInMiniApp(Boolean(result))
      } catch {
        if (!cancelled) setInMiniApp(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const dismissOnboarding = () => {
    try {
      window.localStorage.setItem(ONBOARDING_KEY, "1")
      // Same-tab notification: 'storage' doesn't fire in the same document
      onboardingLocalListeners.forEach((l) => l())
    } catch {}
  }

  const handleAddMiniApp = useCallback(async () => {
    try {
      const response = await sdk.actions.addMiniApp()

      if (response.notificationDetails) {
        toast.success("Mini App added with notifications enabled!")
      } else {
        toast.success("Mini App added without notifications")
      }
    } catch (error) {
      toast.error(`Error: ${error}`)
    }
  }, [])

  const safeAreaStyle = useMemo(
    () => ({
      marginTop: context?.client?.safeAreaInsets?.top ?? 0,
      marginBottom: context?.client?.safeAreaInsets?.bottom ?? 0,
      marginLeft: context?.client?.safeAreaInsets?.left ?? 0,
      marginRight: context?.client?.safeAreaInsets?.right ?? 0,
    }),
    [context?.client?.safeAreaInsets]
  )

  useEffect(() => {
    if (prefersReducedMotion) {
      let rafId: number | null = null
      if (typeof window !== "undefined") {
        rafId = window.requestAnimationFrame(() => setShowParticles(false))
      }
      return () => {
        if (rafId != null) {
          window.cancelAnimationFrame(rafId)
        }
      }
    }

    let cancelled = false
    let idleHandle: number | null = null
    let timeoutHandle: number | null = null

    const schedule = () => {
      if (!cancelled) {
        setShowParticles(true)
      }
    }

    if (typeof window !== "undefined") {
      const idleWindow = window as typeof window & {
        requestIdleCallback?: (
          callback: IdleRequestCallback,
          options?: IdleRequestOptions
        ) => number
        cancelIdleCallback?: (handle: number) => void
      }

      if (idleWindow.requestIdleCallback) {
        idleHandle = idleWindow.requestIdleCallback(schedule, { timeout: 800 })
      } else {
        timeoutHandle = window.setTimeout(schedule, 0)
      }
    }

    return () => {
      cancelled = true
      if (idleHandle != null) {
        const idleWindow = window as typeof window & {
          cancelIdleCallback?: (handle: number) => void
        }
        idleWindow.cancelIdleCallback?.(idleHandle)
      }
      if (timeoutHandle != null) {
        clearTimeout(timeoutHandle)
      }
    }
  }, [prefersReducedMotion])

  return (
    <div style={safeAreaStyle}>
      <div className="mx-auto w-[95%] max-w-lg px-4 py-4">
        <div className="mt-3 mb-6 flex items-center justify-between">
          <div className="justify-left text-2xl font-bold">
            {minikitConfig.miniapp.name}
          </div>
          <div>
            {isFrameReady && inMiniApp && context?.client?.added !== true && (
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
              <GMBase
                sponsored={isBaseApp}
                allowedChainIds={
                  isFarcaster
                    ? [8453, 42220, 10]
                    : isBaseApp
                      ? [8453, 10]
                      : [8453, 42220, 10]
                }
              />
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
                allowedChainIds={
                  isFarcaster
                    ? [8453, 42220, 10]
                    : isBaseApp
                      ? [8453, 10]
                      : [8453, 42220, 10]
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
      {!prefersReducedMotion && showParticles && (
        <Particles
          className="absolute inset-0 z-0"
          quantity={100}
          ease={80}
          color={color}
          refresh
        />
      )}
      {/* Onboarding modal */}
      <OnboardingModal
        open={showOnboarding}
        onClose={dismissOnboarding}
        canSave={Boolean(
          isFrameReady && inMiniApp && context?.client?.added !== true
        )}
        onSave={
          isFrameReady && inMiniApp && context?.client?.added !== true
            ? handleAddMiniApp
            : undefined
        }
      />
    </div>
  )
}
