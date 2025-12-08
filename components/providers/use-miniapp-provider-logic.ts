import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { sdk } from "@farcaster/miniapp-sdk";
import { useEffect, useState } from "react";
import type { MiniAppContext } from "@/types/miniapp";

type MiniAppProviderContextType = {
  context: MiniAppContext | null;
  isInMiniApp: boolean;
} | null;

async function verifyFidWithQuickAuth(): Promise<number | undefined> {
  try {
    const response = await sdk.quickAuth.fetch("/api/auth");
    if (!response.ok) {
      return;
    }
    const data = await response.json();
    if (data.success && data.user?.fid) {
      return data.user.fid;
    }
  } catch {
    // Quick Auth verification failed, continue without verified FID
  }
}

export function useMiniAppProviderLogic() {
  const [miniAppContext, setMiniAppContext] =
    useState<MiniAppProviderContextType>(null);
  const { context } = useMiniKit();

  useEffect(() => {
    const init = async () => {
      try {
        const inMiniApp = await sdk.isInMiniApp();

        // Wait for context to be available before verifying FID
        // This ensures context is fully populated before quick-auth is called
        if (!context) {
          return;
        }

        // Verify FID via Quick Auth once on mini app load
        let verifiedFid: number | undefined;
        if (inMiniApp) {
          verifiedFid = await verifyFidWithQuickAuth();
        }

        setMiniAppContext({
          context: {
            ...(context as unknown as MiniAppContext),
            verifiedFid,
          },
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
