import { useOpenUrl, useViewProfile } from "@coinbase/onchainkit/minikit";
import { sdk } from "@farcaster/miniapp-sdk";
import { useMiniAppContext } from "@/components/providers/miniapp-provider";
import { handleError } from "@/lib/error-handling";

export const PROFILE_FID = 999_883 as const;
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

  const handleOpenMiniApp = async (url: string) => {
    try {
      await sdk.actions.openMiniApp({ url });
    } catch (error) {
      handleError(error, "Failed to open Mini App", {
        operation: "miniapp/open",
        url,
      });
      openUrl(url);
    }
  };

  return {
    isInMiniApp,
    handleOpenMiniApp,
    handleOpenUrl: openUrl,
    handleViewProfile: viewProfile,
  };
};
