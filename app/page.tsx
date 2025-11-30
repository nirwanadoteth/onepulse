"use client";

import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useState } from "react";
import { Header } from "@/components/header";
import { OnboardingModal } from "@/components/onboarding-modal";
import { useMiniAppContext } from "@/components/providers/miniapp-provider";
import { Tabs } from "@/components/tabs";
import type { GmStatsResult } from "@/hooks/use-gm-stats";
import { useMiniAppFlow } from "@/hooks/use-miniapp-flow";
import { useMiniAppInitialization } from "@/hooks/use-miniapp-initialization";
import { useOnboardingModal } from "@/hooks/use-onboarding-modal";
import { usePageState } from "@/hooks/use-page-state";
import { useSafeAreaStyle } from "@/hooks/use-safe-area-style";
import { canSaveMiniApp } from "@/lib/utils";

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
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [completedAllChains, setCompletedAllChains] = useState(false);

  return (
    <div className="mx-auto w-[95%] max-w-lg px-4 py-4">
      <Header
        completedAllChains={completedAllChains}
        gmStats={gmStats?.stats}
        inMiniApp={inMiniApp}
        isMiniAppReady={isMiniAppReady}
        isShareModalOpen={isShareModalOpen}
        onMiniAppAddedAction={handleMiniAppAdded}
        onShareModalOpenChangeAction={setIsShareModalOpen}
      />
      <Tabs
        onAllDoneChangeAction={setCompletedAllChains}
        onGmStatsChangeAction={setGmStats}
        onShareClickAction={() => setIsShareModalOpen(true)}
        onTabChangeAction={setTab}
        tab={tab}
      />
    </div>
  );
}

export default function Home() {
  const miniAppContextData = useMiniAppContext();
  const { inMiniApp } = usePageState();
  const safeAreaStyle = useSafeAreaStyle();
  const { handleMiniAppAdded } = useMiniAppFlow();
  const { shouldShowOnboarding, dismissOnboarding, canSaveApp } =
    useOnboardingModal();
  const [tab, setTab] = useState("home");

  // Call useMiniKit once and pass to initialization hook
  const { isMiniAppReady, setMiniAppReady } = useMiniKit();
  useMiniAppInitialization({ isMiniAppReady, setMiniAppReady });

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
      <OnboardingModal
        canSave={canSaveApp(inMiniApp)}
        onClose={dismissOnboarding}
        onSave={onboardingSaveHandler}
        open={shouldShowOnboarding()}
      />
    </div>
  );
}
