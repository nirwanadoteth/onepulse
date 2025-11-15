import { useEffect } from "react";

type UseMiniAppInitializationProps = {
  isMiniAppReady: boolean;
  setMiniAppReady: () => void;
};

export function useMiniAppInitialization({
  isMiniAppReady,
  setMiniAppReady,
}: UseMiniAppInitializationProps) {
  useEffect(() => {
    if (!isMiniAppReady) {
      setMiniAppReady();
    }
  }, [isMiniAppReady, setMiniAppReady]);
}
