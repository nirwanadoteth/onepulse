import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { sdk } from "@farcaster/miniapp-sdk";
import { useCallback, useEffect, useState } from "react";
import type { MiniAppContext } from "@/types/miniapp";

type MiniAppState = {
  context: MiniAppContext | null;
  isInMiniApp: boolean;
  verifiedFid: number | undefined;
};

type MiniAppProviderContextType =
  | (MiniAppState & {
      signIn: () => Promise<void>;
    })
  | null;

async function verifyFidWithQuickAuth(
  token: string | null
): Promise<number | undefined> {
  try {
    const response = await sdk.quickAuth.fetch("/api/auth", {
      headers: { Authorization: `Bearer ${token}` },
    });
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

async function getToken(): Promise<string | null> {
  try {
    const { token } = await sdk.quickAuth.getToken();
    return token;
  } catch {
    return null;
  }
}

export function useMiniAppProviderLogic() {
  const [state, setState] = useState<MiniAppState | null>(null);
  const { context } = useMiniKit();

  const signIn = useCallback(async () => {
    try {
      const authJWT = await getToken();
      const verifiedFid = await verifyFidWithQuickAuth(authJWT);
      if (verifiedFid) {
        setState((prev) => (prev ? { ...prev, verifiedFid } : prev));
      }
    } catch (e) {
      console.error("Sign in failed", e);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const inMiniApp = await sdk.isInMiniApp();

        setState({
          context: context as unknown as MiniAppContext,
          isInMiniApp: inMiniApp,
          verifiedFid: undefined,
        });
      } catch {
        // MiniApp initialization failure handled gracefully
        setState({
          context: null,
          isInMiniApp: false,
          verifiedFid: undefined,
        });
      }
    };

    init();
  }, [context]);

  const miniAppContext: MiniAppProviderContextType = state
    ? { ...state, signIn }
    : null;

  return {
    miniAppContext,
  };
}
