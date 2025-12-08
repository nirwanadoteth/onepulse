"use client";

import { Header } from "@/components/header";
import { OnboardingModal } from "@/components/onboarding-modal";
import { Tabs } from "@/components/tabs";
import { useContentLogic, useHomePage } from "@/hooks/use-home-page";

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
  const {
    setGmStats,
    isShareModalOpen,
    setIsShareModalOpen,
    completedAllChains,
    setCompletedAllChains,
    openShareModal,
  } = useContentLogic();

  return (
    <div className="mx-auto w-[95%] max-w-lg px-4 py-4">
      <Header
        completedAllChains={completedAllChains}
        inMiniApp={inMiniApp}
        isMiniAppReady={isMiniAppReady}
        isShareModalOpen={isShareModalOpen}
        onMiniAppAddedAction={handleMiniAppAdded}
        onShareModalOpenChangeAction={setIsShareModalOpen}
      />
      <Tabs
        onAllDoneChangeAction={setCompletedAllChains}
        onGmStatsChangeAction={setGmStats}
        onShareClickAction={openShareModal}
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
        onClose={dismissOnboarding}
        onSave={onboardingSaveHandler}
        open={shouldShowOnboarding()}
      />
    </div>
  );
}
