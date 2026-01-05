import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { sdk } from "@farcaster/miniapp-sdk";
import { useEffect, useState } from "react";
import type { MiniAppContext } from "@/types/miniapp";

type MiniAppProviderContextType = {
  context: MiniAppContext | null;
  isInMiniApp: boolean;
} | null;

export function useMiniAppProviderLogic(): {
  miniAppContext: MiniAppProviderContextType;
} {
  const [miniAppContext, setMiniAppContext] =
    useState<MiniAppProviderContextType>(null);
  const { context } = useMiniKit();

  useEffect(() => {
    async function initializeMiniApp(): Promise<void> {
      try {
        const inMiniApp = await sdk.isInMiniApp();

        setMiniAppContext({
          context: context ?? null,
          isInMiniApp: inMiniApp,
        });
      } catch {
        // MiniApp initialization failure handled gracefully
        setMiniAppContext({
          context: null,
          isInMiniApp: false,
        });
      }
    }

    initializeMiniApp();
  }, [context]);

  return {
    miniAppContext,
  };
}
