import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useState } from "react";
import { useMiniAppContext } from "@/components/providers/miniapp-provider";
import type { GmStatsResult } from "@/hooks/use-gm-stats";
import { useMiniAppFlow } from "@/hooks/use-miniapp-flow";
import { useMiniAppInitialization } from "@/hooks/use-miniapp-initialization";
import { useOnboardingModal } from "@/hooks/use-onboarding-modal";
import { usePageState } from "@/hooks/use-page-state";
import { useSafeAreaStyle } from "@/hooks/use-safe-area-style";
import { canSaveMiniApp } from "@/lib/utils";

export const useHomePage = () => {
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

  const onboardingSaveHandler = (() => {
    const shouldEnableSave = canSaveMiniApp({
      isMiniAppReady,
      inMiniApp,
      clientAdded,
    });
    return shouldEnableSave ? handleMiniAppAdded : undefined;
  })();

  return {
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
  };
};

export const useContentLogic = () => {
  const [gmStats, setGmStats] = useState<GmStatsResult | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [completedAllChains, setCompletedAllChains] = useState(false);

  return {
    gmStats,
    setGmStats,
    isShareModalOpen,
    setIsShareModalOpen,
    completedAllChains,
    setCompletedAllChains,
  };
};
