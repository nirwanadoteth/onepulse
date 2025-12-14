import { useAppKitAccount } from "@reown/appkit/react";
import { useEffect } from "react";
import { useMiniAppContext } from "@/components/providers/miniapp-provider";
import { getShareText } from "@/components/share-narratives";
import { setUserShareData } from "@/lib/kv";
import { generateSimplifiedSharePageUrl } from "@/lib/og-utils";

const createShareText = (
  claimedToday: boolean,
  completedAllChains: boolean
) => {
  const text = getShareText(claimedToday, completedAllChains);
  return text.trimEnd();
};

export function useGMSharing(
  claimedToday: boolean,
  completedAllChains: boolean
) {
  const { address } = useAppKitAccount();
  const miniAppContextData = useMiniAppContext();
  const user = miniAppContextData?.context?.user;

  const shareText = createShareText(claimedToday, completedAllChains);
  const shareUrl = generateSimplifiedSharePageUrl({
    address: address || null,
  });

  // Store user data in KV cache for display on share page
  useEffect(() => {
    if (address && user?.username) {
      setUserShareData(address, {
        username: user.username,
        displayName: user.displayName || user.username,
        pfp: user.pfpUrl,
      }).catch(() => {
        // Silently fail if KV store is unavailable
      });
    }
  }, [address, user?.username, user?.displayName, user?.pfpUrl]);

  return {
    shareText,
    shareUrl,
  };
}
