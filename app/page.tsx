"use client"

import { useMemo, useState } from "react"
import dynamic from "next/dynamic"

import { useFrameInitialization } from "@/hooks/use-frame-initialization"
import { useMetaColor } from "@/hooks/use-meta-color"
import { useMiniAppFlow } from "@/hooks/use-miniapp-flow"
import { useOnboardingModal } from "@/hooks/use-onboarding-modal"
import { usePageState } from "@/hooks/use-page-state"
import { useParticlesAnimation } from "@/hooks/use-particles-animation"
import { useSafeAreaStyle } from "@/hooks/use-safe-area-style"
import { DisconnectWalletSection } from "@/components/disconnect-wallet-section"
import { HomeHeader } from "@/components/home-header"
import { HomeTabs } from "@/components/home-tabs"
import { OnboardingModal } from "@/components/onboarding-modal"
import { useMiniAppContext } from "@/components/providers/miniapp-provider"

const Particles = dynamic(
  () =>
    import("@/components/ui/particles").then((mod) => ({
      default: mod.Particles,
    })),
  { ssr: false, loading: () => null }
)

function determineOnboardingSaveHandler(
  isFrameReady: boolean,
  inMiniApp: boolean,
  clientAdded: boolean | undefined,
  handleMiniAppAdded: () => void
) {
  const shouldEnableSave = isFrameReady && inMiniApp && clientAdded !== true
  return shouldEnableSave ? handleMiniAppAdded : undefined
}

interface HomeContentProps {
  isFrameReady: boolean
  inMiniApp: boolean
  isConnected: boolean
  showDisconnect: boolean
  handleMiniAppAdded: () => void
  tab: string
  setTab: (tab: string) => void
}

function HomeContent({
  isFrameReady,
  inMiniApp,
  isConnected,
  showDisconnect,
  handleMiniAppAdded,
  tab,
  setTab,
}: HomeContentProps) {
  return (
    <>
      <div className="mx-auto w-[95%] max-w-lg px-4 py-4">
        <HomeHeader
          isFrameReady={isFrameReady}
          inMiniApp={inMiniApp}
          onMiniAppAdded={handleMiniAppAdded}
        />
        <HomeTabs tab={tab} onTabChange={setTab} />
        <DisconnectWalletSection
          isConnected={isConnected}
          showDisconnect={showDisconnect}
          onTabChange={setTab}
        />
      </div>
    </>
  )
}

interface HomeBackgroundProps {
  showParticles: boolean
  prefersReducedMotion: boolean | null
  particleQuantity: number
  metaColor: string
}

function HomeBackground({
  showParticles,
  prefersReducedMotion,
  particleQuantity,
  metaColor,
}: HomeBackgroundProps) {
  if (!showParticles || prefersReducedMotion) {
    return null
  }

  return (
    <Particles
      className="absolute inset-0 z-0"
      quantity={particleQuantity}
      ease={80}
      color={metaColor}
      refresh
    />
  )
}

export default function Home() {
  const miniAppContextData = useMiniAppContext()
  const { inMiniApp, isConnected } = usePageState()
  const { showParticles, prefersReducedMotion } = useParticlesAnimation()
  const safeAreaStyle = useSafeAreaStyle()
  const { metaColor } = useMetaColor()
  const { handleMiniAppAdded } = useMiniAppFlow()
  const { shouldShowOnboarding, dismissOnboarding, canSaveApp } =
    useOnboardingModal()
  const [tab, setTab] = useState("home")

  useFrameInitialization()

  // Optimize particle count based on screen size for better mobile performance
  const particleQuantity = useMemo(() => {
    if (typeof window === "undefined") return 100
    return window.innerWidth < 768 ? 50 : 100
  }, [])

  const isFrameReady = miniAppContextData?.context !== null
  const clientAdded = miniAppContextData?.context?.client?.added

  const onboardingSaveHandler = determineOnboardingSaveHandler(
    isFrameReady,
    inMiniApp,
    clientAdded,
    handleMiniAppAdded
  )

  return (
    <div style={safeAreaStyle}>
      <HomeContent
        isFrameReady={isFrameReady}
        inMiniApp={inMiniApp}
        isConnected={isConnected}
        showDisconnect={!miniAppContextData?.isInMiniApp}
        handleMiniAppAdded={handleMiniAppAdded}
        tab={tab}
        setTab={setTab}
      />
      <HomeBackground
        showParticles={showParticles}
        prefersReducedMotion={prefersReducedMotion}
        particleQuantity={particleQuantity}
        metaColor={metaColor}
      />
      <OnboardingModal
        open={shouldShowOnboarding()}
        onClose={dismissOnboarding}
        canSave={canSaveApp(inMiniApp)}
        onSave={onboardingSaveHandler}
      />
    </div>
  )
}
