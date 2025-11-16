"use client";

import { useOpenUrl } from "@coinbase/onchainkit/minikit";
import { sdk } from "@farcaster/miniapp-sdk";
import { Copy, MessageCircle } from "lucide-react";
import { Icons } from "@/components/icons";
import {
  type UserContext,
  useMiniAppContext,
} from "@/components/providers/miniapp-provider";
import {
  getMilestoneContext,
  getSpecialMilestone,
  STREAK_NARRATIVES,
} from "@/components/share-narratives";
import { Button } from "@/components/ui/button";
import type { GmStats } from "@/hooks/use-gm-stats";
import { generateGMStatusMetadata } from "@/lib/og-utils";

type ShareGMStatusProps = {
  className?: string;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  claimedToday?: boolean;
  gmStats?: GmStats;
};

const getUsername = (user: UserContext | null) =>
  user?.username || user?.displayName || "Anonymous";

const getGMStats = (gmStats: GmStats | undefined) => ({
  currentStreak: gmStats?.currentStreak || 0,
  totalGMs: gmStats?.allTimeGmCount || 0,
});

const hasGMedToday = (gmStats: GmStats | undefined) => {
  if (!gmStats?.lastGmDay) {
    return false;
  }
  const today = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return gmStats.lastGmDay === today;
};

const createShareText = (
  claimedToday: boolean,
  currentStreak: number,
  totalGMs = 0,
  todayGM = false
) => {
  const getStreakNarrative = (streak: number, claimed: boolean) => {
    const narrative = STREAK_NARRATIVES.find((n) => streak <= n.max);
    if (!narrative) {
      return "";
    }

    return claimed ? narrative.claimed(streak) : narrative.unclaimed(streak);
  };

  // Check for special milestone messages (takes precedence over generic narrative)
  const specialMilestone = getSpecialMilestone(currentStreak, totalGMs);
  if (specialMilestone) {
    return claimedToday ? specialMilestone.claimed : specialMilestone.unclaimed;
  }

  // Regular format: headline + narrative + context
  const headline = claimedToday
    ? "Just claimed my daily reward on OnePulse! 🚀"
    : "Check out my OnePulse progress! 📊";

  const streakNarrative = getStreakNarrative(
    currentStreak,
    claimedToday || todayGM
  );

  const milestoneContext = getMilestoneContext(totalGMs);

  return milestoneContext
    ? `${headline}\n\n${streakNarrative}\n${milestoneContext}`
    : `${headline}\n\n${streakNarrative}`;
};

const createShareMetadata = (options: {
  username: string;
  currentStreak: number;
  totalGMs: number;
  todayGM: boolean;
  claimedToday: boolean;
}) =>
  generateGMStatusMetadata({
    username: options.username,
    streak: options.currentStreak,
    totalGMs: options.totalGMs,
    chains: ["Base"],
    todayGM: options.todayGM,
    claimedToday: options.claimedToday,
  });

function useGMSharing(claimedToday: boolean, gmStats?: GmStats) {
  const miniAppContextData = useMiniAppContext();
  const openUrl = useOpenUrl();

  const username = getUsername(miniAppContextData?.context?.user ?? null);
  const { currentStreak, totalGMs } = getGMStats(gmStats);
  const todayGM = hasGMedToday(gmStats);

  const shareText = createShareText(
    claimedToday,
    currentStreak,
    totalGMs,
    todayGM
  );
  const metadata = createShareMetadata({
    username,
    currentStreak,
    totalGMs,
    todayGM,
    claimedToday,
  });

  return {
    shareText,
    shareUrl: metadata.url,
    openUrl,
  };
}

const shareToTwitter = (
  shareText: string,
  shareUrl: string,
  openUrl: (url: string) => void
) => {
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareText
  )}&url=${encodeURIComponent(shareUrl)}`;
  openUrl(twitterUrl);
};

const shareToCast = async (shareText: string, shareUrl: string) => {
  try {
    await sdk.actions.composeCast({
      text: `${shareText}`,
      embeds: [shareUrl],
    });
  } catch {
    // Cast composition failure handled by copying to clipboard
    navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
  }
};

const shareToClipboard = (shareText: string, shareUrl: string) => {
  const fullText = `${shareText}\n\n${shareUrl}`;
  navigator.clipboard.writeText(fullText);
};

export function ShareGMStatus({
  className,
  variant = "outline",
  size = "default",
  claimedToday = false,
  gmStats,
}: ShareGMStatusProps) {
  const { shareText, shareUrl, openUrl } = useGMSharing(claimedToday, gmStats);

  const handleShare = async (platform: "twitter" | "cast" | "copy") => {
    switch (platform) {
      case "twitter":
        shareToTwitter(shareText, shareUrl, openUrl);
        break;
      case "cast":
        await shareToCast(shareText, shareUrl);
        break;
      case "copy":
        shareToClipboard(shareText, shareUrl);
        break;
      default:
        break;
    }
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <Button
        className="flex-1"
        onClick={() => handleShare("twitter")}
        size={size}
        variant={variant}
      >
        <Icons.twitter className="mr-2 h-4 w-4" />
        Twitter
      </Button>
      <Button
        className="flex-1"
        onClick={() => handleShare("cast")}
        size={size}
        variant={variant}
      >
        <MessageCircle className="mr-2 h-4 w-4" />
        Cast
      </Button>
      <Button
        className="flex-1"
        onClick={() => handleShare("copy")}
        size={size}
        variant={variant}
      >
        <Copy className="mr-2 h-4 w-4" />
        Copy
      </Button>
    </div>
  );
}
