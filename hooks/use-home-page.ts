import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useMiniAppInitialization } from "@/hooks/use-miniapp-initialization";
import { useSafeAreaStyle } from "@/hooks/use-safe-area-style";

type UseHomePageReturn = {
  safeAreaStyle: Record<string, number>;
};

export function useHomePage(): UseHomePageReturn {
  const safeAreaStyle = useSafeAreaStyle();

  // Call useMiniKit once and pass to initialization hook
  const { isMiniAppReady, setMiniAppReady } = useMiniKit();
  useMiniAppInitialization({ isMiniAppReady, setMiniAppReady });

  return {
    safeAreaStyle,
  };
}
