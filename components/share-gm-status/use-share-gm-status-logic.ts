import { useGMSharing } from "@/hooks/use-gm-sharing";
import type { GmStats } from "@/hooks/use-gm-stats";
import { useShareActions } from "@/hooks/use-share-actions";

export function useShareGMStatusLogic(
  claimedToday: boolean,
  completedAllChains: boolean,
  gmStats?: GmStats
) {
  const { shareText, shareUrl } = useGMSharing(
    claimedToday,
    completedAllChains,
    gmStats
  );
  const { shareToCast, shareToClipboard } = useShareActions();

  const handleShare = async (platform: "cast" | "copy") => {
    if (platform === "cast") {
      await shareToCast(shareText, shareUrl);
    } else {
      shareToClipboard(shareText, shareUrl);
    }
  };

  return {
    handleShare,
  };
}
