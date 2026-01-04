import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useState } from "react";
import { useMiniAppContext } from "@/components/providers/miniapp-provider";
import { useGMSharing } from "@/hooks/use-gm-sharing";
import type { GmStatsResult } from "@/hooks/use-gm-stats";
import { useMiniAppFlow } from "@/hooks/use-miniapp-flow";
import { useMiniAppInitialization } from "@/hooks/use-miniapp-initialization";
import { useOnboardingModal } from "@/hooks/use-onboarding-modal";
import { usePageState } from "@/hooks/use-page-state";
import { useSafeAreaStyle } from "@/hooks/use-safe-area-style";
import { useShareActions } from "@/hooks/use-share-actions";
import {
  BASE_CHAIN_ID,
} from "@/lib/constants";
import { canSaveMiniApp } from "@/lib/utils";
import { useClaimEligibility } from "./use-reward-claim";

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
  const [completedAllChains, setCompletedAllChains] = useState(false);
  const miniAppContextData = useMiniAppContext();
  const fidRaw = miniAppContextData?.context?.user?.fid;
  const fid = fidRaw !== undefined ? BigInt(fidRaw) : undefined;
  const isInMiniApp = miniAppContextData?.isInMiniApp ?? false;

  // Only check eligibility in mini app context
  const shouldCheckEligibility = Boolean(fid) && isInMiniApp;

  const baseEligibility = useClaimEligibility({
    fid,
    chainId: BASE_CHAIN_ID,
    enabled: shouldCheckEligibility,
  });

  const claimedToday = Boolean(baseEligibility.claimStatus?.fidClaimedToday);

  const { shareText, shareUrl } = useGMSharing(
    claimedToday,
    completedAllChains
  );
  const { shareToCast } = useShareActions();
  const shareNow = async () => {
    if (!shareUrl) {
      return;
    }
    await shareToCast(shareText, shareUrl);
  };

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
    shareNow,
  };
};
