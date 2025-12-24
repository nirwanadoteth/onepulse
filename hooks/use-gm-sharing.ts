import { useAppKitAccount } from "@reown/appkit/react";
import { useEffect } from "react";
import { useMiniAppContext } from "@/components/providers/miniapp-provider";
import { getShareText } from "@/components/share-narratives";
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
  const { address } = useAppKitAccount({ namespace: "eip155" });
  const miniAppContextData = useMiniAppContext();
  const user = miniAppContextData?.context?.user;

  const shareText = createShareText(claimedToday, completedAllChains);
  const shareUrl = address
    ? generateSimplifiedSharePageUrl({
        address,
      })
    : null;

  // Extract user properties with stable defaults to prevent dependency array size changes
  const username = user?.username ?? "";
  const displayName = user?.displayName ?? "";
  const pfpUrl = user?.pfpUrl ?? "";

  // Store user data in KV cache for display on share page
  useEffect(() => {
    if (address && username) {
      fetch("/api/share/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address,
          data: {
            username,
            displayName: displayName || username,
            pfp: pfpUrl,
          },
        }),
      }).catch(() => {
        // Silently fail if KV store is unavailable
      });
    }
  }, [address, username, displayName, pfpUrl]);

  return {
    shareText,
    shareUrl,
  };
}
