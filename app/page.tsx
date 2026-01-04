"use client";

import dynamic from "next/dynamic";
import { Header } from "@/components/header";
import { Tabs } from "@/components/tabs";
import { useContentLogic, useHomePage } from "@/hooks/use-home-page";

const OnboardingModal = dynamic(() =>
  import("@/components/onboarding-modal").then((mod) => mod.OnboardingModal)
);

type ContentProps = {
  tab: string;
  setTab: (tab: string) => void;
};

function Content({ tab, setTab }: ContentProps) {
  const { setGmStats } = useContentLogic();

  return (
    <div className="mx-auto w-[95%] max-w-lg px-4 py-4">
      <Header />
      <Tabs
        onGmStatsChangeAction={setGmStats}
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
    shouldShowOnboarding,
    dismissOnboarding,
    canSaveApp,
    tab,
    setTab,
    onboardingSaveHandler,
  } = useHomePage();

  return (
    <div className="font-sans" style={safeAreaStyle}>
      <Content setTab={setTab} tab={tab} />
      <OnboardingModal
        canSave={canSaveApp(inMiniApp)}
        onCloseAction={dismissOnboarding}
        onSaveAction={onboardingSaveHandler}
        open={shouldShowOnboarding()}
      />
    </div>
  );
}
