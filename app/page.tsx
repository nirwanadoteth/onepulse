"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { useMiniKit } from "@coinbase/onchainkit/minikit"

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

const Particles = dynamic(
  () =>
    import("@/components/ui/particles").then((mod) => ({
      default: mod.Particles,
    })),
  { ssr: false, loading: () => null }
)

export default function Home() {
  const { isFrameReady, context } = useMiniKit()
  const { isSmartWallet, inMiniApp, isConnected } = usePageState()
  const { showParticles, prefersReducedMotion } = useParticlesAnimation()
  const safeAreaStyle = useSafeAreaStyle()
  const { metaColor } = useMetaColor()
  const { handleMiniAppAdded } = useMiniAppFlow()
  const { shouldShowOnboarding, dismissOnboarding, canSaveApp } =
    useOnboardingModal()
  const [tab, setTab] = useState("home")

  useFrameInitialization()

  return (
    <div style={safeAreaStyle}>
      <div className="mx-auto w-[95%] max-w-lg px-4 py-4">
        <HomeHeader
          isFrameReady={isFrameReady}
          inMiniApp={inMiniApp}
          onMiniAppAdded={handleMiniAppAdded}
        />
        <HomeTabs
          tab={tab}
          onTabChange={setTab}
          isSmartWallet={isSmartWallet}
          onProfileDisconnected={() => setTab("home")}
        />
        <DisconnectWalletSection
          isConnected={isConnected}
          showDisconnect={!context?.user}
          onTabChange={setTab}
        />
      </div>
      {!prefersReducedMotion && showParticles && (
        <Particles
          className="absolute inset-0 z-0"
          quantity={100}
          ease={80}
          color={metaColor}
          refresh
        />
      )}
      <OnboardingModal
        open={shouldShowOnboarding(isConnected)}
        onClose={dismissOnboarding}
        canSave={canSaveApp(inMiniApp)}
        onSave={
          isFrameReady && inMiniApp && context?.client?.added !== true
            ? handleMiniAppAdded
            : undefined
        }
      />
    </div>
  )
}
