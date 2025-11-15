import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useEffect } from "react";

export function useMiniAppInitialization() {
  const { isMiniAppReady, setMiniAppReady } = useMiniKit();

  useEffect(() => {
    if (!isMiniAppReady) {
      setMiniAppReady();
    }
  }, [isMiniAppReady, setMiniAppReady]);
}
