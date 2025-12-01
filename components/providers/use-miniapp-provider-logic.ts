import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { sdk } from "@farcaster/miniapp-sdk";
import { useEffect, useState } from "react";
import type { MiniAppContext } from "@/types/miniapp";

type MiniAppProviderContextType = {
  context: MiniAppContext | null;
  isInMiniApp: boolean;
} | null;

export function useMiniAppProviderLogic() {
  const [miniAppContext, setMiniAppContext] =
    useState<MiniAppProviderContextType>(null);
  const { context } = useMiniKit();

  useEffect(() => {
    const init = async () => {
      try {
        const inMiniApp = await sdk.isInMiniApp();

        setMiniAppContext({
          context: context as unknown as MiniAppContext,
          isInMiniApp: inMiniApp,
        });
      } catch {
        // MiniApp initialization failure handled gracefully
        setMiniAppContext({
          context: null,
          isInMiniApp: false,
        });
      }
    };

    init();
  }, [context]);

  return {
    miniAppContext,
  };
}
