import { useOpenUrl } from "@coinbase/onchainkit/minikit";
import {
  type UserContext,
  useMiniAppContext,
} from "@/components/providers/miniapp-provider";
import { getShareText } from "@/components/share-narratives";
import type { GmStats } from "@/hooks/use-gm-stats";
import { generateSharePageUrl } from "@/lib/og-utils";

const getUsername = (user: UserContext | null) =>
  user?.username || user?.displayName || "User";

const createShareText = (
  claimedToday: boolean,
  completedAllChains: boolean
) => {
  const text = getShareText(claimedToday, completedAllChains);
  return `${text}`.trimEnd();
};

export function useGMSharing(
  claimedToday: boolean,
  completedAllChains: boolean,
  gmStats?: GmStats
) {
  const miniAppContextData = useMiniAppContext();
  const openUrl = useOpenUrl();

  const user = miniAppContextData?.context?.user;
  const username = getUsername(user ?? null);
  const displayName = user?.displayName || username;
  const pfp = user?.pfpUrl || "";

  const shareText = createShareText(claimedToday, completedAllChains);
  const shareUrl = generateSharePageUrl({
    username,
    displayName,
    pfp,
    chains: gmStats?.chains || [],
  });

  return {
    shareText,
    shareUrl,
    openUrl,
  };
}
