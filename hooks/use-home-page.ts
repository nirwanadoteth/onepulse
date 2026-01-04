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

  // Always start with "home" to avoid hydration mismatch
  const [tab, setTab] = useState("home");

  // Call useMiniKit once and pass to initialization hook
  const { isMiniAppReady, setMiniAppReady } = useMiniKit();
  useMiniAppInitialization({ isMiniAppReady, setMiniAppReady });

  const clientAdded = miniAppContextData?.context?.client?.added ?? false;

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
    shouldShowOnboarding,
    dismissOnboarding,
    canSaveApp,
    tab,
    setTab,
    onboardingSaveHandler,
  };
};

export const useContentLogic = () => {
  const [gmStats, setGmStats] = useState<GmStatsResult | null>(null);
  const [completedAllChains, setCompletedAllChains] = useState(false);

  // Memoize setGmStats to prevent infinite re-render loop
  const handleGmStatsChange = (stats: GmStatsResult) => {
    setGmStats((prev) => {
      // Only update if stats actually changed
      if (
        prev &&
        prev.isReady === stats.isReady &&
        JSON.stringify(prev.stats) === JSON.stringify(stats.stats)
      ) {
        return prev;
      }
      return stats;
    });
  };

  // Memoize setCompletedAllChains to prevent infinite re-render loop
  const handleAllDoneChange = (allDone: boolean) => {
    setCompletedAllChains((prev) => (prev === allDone ? prev : allDone));
  };

  return {
    gmStats,
    setGmStats: handleGmStatsChange,
    completedAllChains,
    setCompletedAllChains: handleAllDoneChange,
  };
};
