"use client";

import dynamic from "next/dynamic";
import { Header } from "@/components/header";
import { Tabs } from "@/components/tabs";
import { useContentLogic, useHomePage } from "@/hooks/use-home-page";

const OnboardingModal = dynamic(() =>
  import("@/components/onboarding-modal").then((mod) => mod.OnboardingModal)
);

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
  const { gmStats, setGmStats, setCompletedAllChains, shareNow } =
    useContentLogic();

  return (
    <div className="mx-auto w-[95%] max-w-lg px-4 py-4">
      <Header
        gmStats={gmStats?.stats}
        inMiniApp={inMiniApp}
        isMiniAppReady={isMiniAppReady}
        onMiniAppAddedAction={handleMiniAppAdded}
        onShareClickAction={shareNow}
      />
      <Tabs
        onAllDoneChangeAction={setCompletedAllChains}
        onGmStatsChangeAction={setGmStats}
        onShareClickAction={shareNow}
        onTabChangeAction={setTab}
        tab={tab}
      />
    </div>
  );
}

export default function Home() {
  const {
    inMiniApp,
    safeAreaStyle,
    handleMiniAppAdded,
    shouldShowOnboarding,
    dismissOnboarding,
    canSaveApp,
    tab,
    setTab,
    isMiniAppReady,
    onboardingSaveHandler,
  } = useHomePage();

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
        onCloseAction={dismissOnboarding}
        onSaveAction={onboardingSaveHandler}
        open={shouldShowOnboarding()}
      />
    </div>
  );
}
