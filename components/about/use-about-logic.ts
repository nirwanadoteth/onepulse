import { useOpenUrl, useViewProfile } from "@coinbase/onchainkit/minikit";
import { sdk } from "@farcaster/miniapp-sdk";
import { useCallback } from "react";
import { useMiniAppContext } from "@/components/providers/miniapp-provider";
import { handleError } from "@/lib/error-handling";

export const PRODUCT_CLANK_MINIAPP_URL =
  "https://miniapp.productclank.com/frame/25a3822f-e828-4af5-868c-a2061bf66e20?referrer=52d833eb-c0b5-484f-baa9-49eb95317ecf" as const;
export const PRODUCT_CLANK_WEB_URL =
  "https://app.productclank.com/product/25a3822f-e828-4af5-868c-a2061bf66e20?referrer=52d833eb-c0b5-484f-baa9-49eb95317ecf" as const;
export const PROFILE_FID = 999_883 as const;
export const GITHUB_URL = "https://github.com/nirwanadoteth/onepulse" as const;
export const TWITTER_URL = "https://twitter.com/nirwana_eth" as const;
export const BASE_APP_PROFILE_URL =
  "https://base.app/profile/nirwana.eth" as const;
export const FARCASTER_PROFILE_URL =
  "https://farcaster.xyz/nirwana.eth" as const;

export type AboutLogic = {
  isInMiniApp: boolean;
  handleOpenMiniApp: (url: string) => Promise<void>;
  handleOpenUrl: (url: string) => void;
  handleViewProfile: (fid: number) => void;
};

export const useAboutLogic = (): AboutLogic => {
  const miniappContext = useMiniAppContext();
  const openUrl = useOpenUrl();
  const viewProfile = useViewProfile();

  const isInMiniApp = Boolean(miniappContext?.isInMiniApp);

  const handleOpenMiniApp = useCallback(
    async (url: string) => {
      try {
        await sdk.actions.openMiniApp({ url });
      } catch (error) {
        handleError(error, "Failed to open Mini App", {
          operation: "miniapp/open",
          url,
        });
        openUrl(url);
      }
    },
    [openUrl]
  );

  return {
    isInMiniApp,
    handleOpenMiniApp,
    handleOpenUrl: openUrl,
    handleViewProfile: viewProfile,
  };
};
