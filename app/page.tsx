"use client";

import { useMiniKit } from "@coinbase/onchainkit/minikit";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { Header } from "@/components/header";
import { OnboardingModal } from "@/components/onboarding-modal";
import { useMiniAppContext } from "@/components/providers/miniapp-provider";
import { Tabs } from "@/components/tabs";
import type { GmStatsResult } from "@/hooks/use-gm-stats";
import { useMetaColor } from "@/hooks/use-meta-color";
import { useMiniAppFlow } from "@/hooks/use-miniapp-flow";
import { useMiniAppInitialization } from "@/hooks/use-miniapp-initialization";
import { useOnboardingModal } from "@/hooks/use-onboarding-modal";
import { usePageState } from "@/hooks/use-page-state";
import { useParticlesAnimation } from "@/hooks/use-particles-animation";
import { useSafeAreaStyle } from "@/hooks/use-safe-area-style";
import { canSaveMiniApp } from "@/lib/utils";

const Particles = dynamic(
  () =>
    import("@/components/ui/particles").then((mod) => ({
      default: mod.Particles,
    })),
  { ssr: false, loading: () => null }
);

function determineOnboardingSaveHandler(
  isMiniAppReady: boolean,
  inMiniApp: boolean,
  clientAdded: boolean | undefined,
  handleMiniAppAdded: () => void
) {
  const shouldEnableSave = canSaveMiniApp({
    isMiniAppReady,
    inMiniApp,
    clientAdded,
  });
  return shouldEnableSave ? handleMiniAppAdded : undefined;
}

type ContentProps = {
  isMiniAppReady: boolean;
  inMiniApp: boolean;
  handleMiniAppAdded: () => void;
  tab: string;
  setTab: (tab: string) => void;
};

function Content({
  isMiniAppReady,
  inMiniApp,
  handleMiniAppAdded,
  tab,
  setTab,
}: ContentProps) {
  const [gmStats, setGmStats] = useState<GmStatsResult | null>(null);

  return (
    <div className="mx-auto w-[95%] max-w-lg px-4 py-4">
      <Header
        gmStats={gmStats?.stats}
        inMiniApp={inMiniApp}
        isMiniAppReady={isMiniAppReady}
        onMiniAppAddedAction={handleMiniAppAdded}
      />
      <Tabs
        onGmStatsChangeAction={setGmStats}
        onShareClickAction={() =>
          window.dispatchEvent(new CustomEvent("open-share-modal"))
        }
        onTabChangeAction={setTab}
        tab={tab}
      />
    </div>
  );
}

type BackgroundProps = {
  showParticles: boolean;
  prefersReducedMotion: boolean | null;
  particleQuantity: number;
  metaColor: string;
};

function Background({
  showParticles,
  prefersReducedMotion,
  particleQuantity,
  metaColor,
}: BackgroundProps) {
  if (!showParticles || prefersReducedMotion) {
    return null;
  }

  return (
    <Particles
      className="absolute inset-0 z-0"
      color={metaColor}
      ease={80}
      quantity={particleQuantity}
      refresh
    />
  );
}

export default function Home() {
  const miniAppContextData = useMiniAppContext();
  const { inMiniApp } = usePageState();
  const { showParticles, prefersReducedMotion } = useParticlesAnimation();
  const safeAreaStyle = useSafeAreaStyle();
  const { metaColor } = useMetaColor();
  const { handleMiniAppAdded } = useMiniAppFlow();
  const { shouldShowOnboarding, dismissOnboarding, canSaveApp } =
    useOnboardingModal();
  const [tab, setTab] = useState("home");

  // Call useMiniKit once and pass to initialization hook
  const { isMiniAppReady, setMiniAppReady } = useMiniKit();
  useMiniAppInitialization({ isMiniAppReady, setMiniAppReady });

  // Optimize particle count based on screen size for better mobile performance
  const particleQuantity = useMemo(() => {
    if (typeof window === "undefined") {
      return 100;
    }
    return window.innerWidth < 768 ? 50 : 100;
  }, []);
  const clientAdded = miniAppContextData?.context?.client?.added;

  const onboardingSaveHandler = determineOnboardingSaveHandler(
    isMiniAppReady,
    inMiniApp,
    clientAdded,
    handleMiniAppAdded
  );

  return (
    <div className="font-sans" style={safeAreaStyle}>
      <Content
        handleMiniAppAdded={handleMiniAppAdded}
        inMiniApp={inMiniApp}
        isMiniAppReady={isMiniAppReady}
        setTab={setTab}
        tab={tab}
      />
      <Background
        metaColor={metaColor}
        particleQuantity={particleQuantity}
        prefersReducedMotion={prefersReducedMotion}
        showParticles={showParticles}
      />
      <OnboardingModal
        canSave={canSaveApp(inMiniApp)}
        onClose={dismissOnboarding}
        onSave={onboardingSaveHandler}
        open={shouldShowOnboarding()}
      />
    </div>
  );
}
