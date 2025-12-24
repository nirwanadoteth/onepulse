import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  CELO_CHAIN_ID,
  OPTIMISM_CHAIN_ID,
} from "@/lib/constants";
import { canSaveMiniApp } from "@/lib/utils";
import { useClaimEligibility } from "./use-reward-claim";

const TAB_STORAGE_KEY = "onepulse_active_tab";

function getStoredTab(): string {
  if (typeof window === "undefined") {
    return "home";
  }
  try {
    return localStorage.getItem(TAB_STORAGE_KEY) || "home";
  } catch {
    return "home";
  }
}

function storeTab(tab: string) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    localStorage.setItem(TAB_STORAGE_KEY, tab);
  } catch {
    // Ignore storage errors
  }
}

export const useHomePage = () => {
  const miniAppContextData = useMiniAppContext();
  const { inMiniApp } = usePageState();
  const safeAreaStyle = useSafeAreaStyle();
  const { handleMiniAppAdded } = useMiniAppFlow();
  const { shouldShowOnboarding, dismissOnboarding, canSaveApp } =
    useOnboardingModal();

  // Always start with "home" to avoid hydration mismatch
  const [tab, setTabInternal] = useState("home");

  // Restore tab from localStorage after mount (client-side only)
  useEffect(() => {
    const storedTab = getStoredTab();
    if (storedTab !== "home") {
      setTabInternal(storedTab);
    }
  }, []);

  // Persist tab changes to localStorage
  const setTab = useCallback((newTab: string) => {
    setTabInternal(newTab);
    storeTab(newTab);
  }, []);

  // Call useMiniKit once and pass to initialization hook
  const { isMiniAppReady, setMiniAppReady } = useMiniKit();
  useMiniAppInitialization({ isMiniAppReady, setMiniAppReady });

  const clientAdded = miniAppContextData?.context?.client?.added ?? false;

  const onboardingSaveHandler = useMemo(() => {
    const shouldEnableSave = canSaveMiniApp({
      isMiniAppReady,
      inMiniApp,
      clientAdded,
    });
    return shouldEnableSave ? handleMiniAppAdded : undefined;
  }, [isMiniAppReady, inMiniApp, clientAdded, handleMiniAppAdded]);

  return useMemo(
    () => ({
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
    }),
    [
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
    ]
  );
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
  const celoEligibility = useClaimEligibility({
    fid,
    chainId: CELO_CHAIN_ID,
    enabled: shouldCheckEligibility,
  });
  const optimismEligibility = useClaimEligibility({
    fid,
    chainId: OPTIMISM_CHAIN_ID,
    enabled: shouldCheckEligibility,
  });

  const claimedToday = Boolean(
    baseEligibility.claimStatus?.fidClaimedToday ||
      celoEligibility.claimStatus?.fidClaimedToday ||
      optimismEligibility.claimStatus?.fidClaimedToday
  );

  const { shareText, shareUrl } = useGMSharing(
    claimedToday,
    completedAllChains
  );
  const { shareToCast } = useShareActions();
  const shareNow = useCallback(async () => {
    if (!shareUrl) {
      return;
    }
    await shareToCast(shareText, shareUrl);
  }, [shareText, shareUrl, shareToCast]);

  // Memoize setGmStats to prevent infinite re-render loop
  const handleGmStatsChange = useCallback((stats: GmStatsResult) => {
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
  }, []);

  // Memoize setCompletedAllChains to prevent infinite re-render loop
  const handleAllDoneChange = useCallback((allDone: boolean) => {
    setCompletedAllChains((prev) => (prev === allDone ? prev : allDone));
  }, []);

  return useMemo(
    () => ({
      gmStats,
      setGmStats: handleGmStatsChange,
      completedAllChains,
      setCompletedAllChains: handleAllDoneChange,
      shareNow,
    }),
    [
      gmStats,
      completedAllChains,
      shareNow,
      handleGmStatsChange,
      handleAllDoneChange,
    ]
  );
};
