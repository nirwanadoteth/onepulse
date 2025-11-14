"use client";

import { useOpenUrl } from "@coinbase/onchainkit/minikit";
import { sdk } from "@farcaster/miniapp-sdk";
import { Copy, MessageCircle } from "lucide-react";
import { Icons } from "@/components/icons";
import {
  type UserContext,
  useMiniAppContext,
} from "@/components/providers/miniapp-provider";
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
  const claimMessages = [
    "🚀 Just snagged my daily DEGEN rewards!",
    "💰 DEGEN rewards claimed and secured!",
    "🎯 Daily GM rewards in the bag!",
    "⚡ Powered up with fresh DEGEN rewards!",
    "🌟 Claimed my GM rewards - let's go!",
  ];

  const statusMessages = [
    "📊 Check out my epic GM status!",
    "🔥 My GM journey so far:",
    "⚡ GM stats incoming:",
    "🎮 Level up my GM game:",
    "🚀 GM status report:",
  ];

  const getStreakMessage = (streak: number, claimed: boolean) => {
    const streakConfigs = [
      {
        max: 0,
        claimed: "Starting my GM empire! 👑",
        unclaimed: "Ready to start my GM streak! 💪",
      },
      {
        max: 1,
        claimed: "First GM reward claimed! 🎉",
        unclaimed: "One down, many more to go! 🔥",
      },
      {
        max: 2,
        claimed: `${streak}-day GM streak growing! 📈`,
        unclaimed: `${streak}-day streak in progress! ⚡`,
      },
      {
        max: 6,
        claimed: `${streak}-day GM fire burning hot! 🔥`,
        unclaimed: `${streak}-day momentum building! 💨`,
      },
      {
        max: 13,
        claimed: `${streak}-day GM legend status! 👑`,
        unclaimed: `${streak}-day streak crushing it! 💪`,
      },
      {
        max: 29,
        claimed: `${streak}-day GM immortality! 🌟`,
        unclaimed: `${streak}-day unstoppable! 🚀`,
      },
      {
        max: 49,
        claimed: `${streak}-day GM god mode! ⚡`,
        unclaimed: `${streak}-day absolute unit! 💎`,
      },
      {
        max: Number.POSITIVE_INFINITY,
        claimed: `${streak}-day GM eternal flame! 🔥`,
        unclaimed: `${streak}-day legendary status! 👑`,
      },
    ];

    const config = streakConfigs.find((c) => streak <= c.max);
    return config ? (claimed ? config.claimed : config.unclaimed) : "";
  };

  const getMilestoneMessage = (total: number) => {
    const milestones = [
      {
        threshold: 100,
        message: ` (${total} total GMs - absolute legend! 🏆)`,
      },
      { threshold: 50, message: ` (${total} total GMs - on fire! 🔥)` },
      { threshold: 25, message: ` (${total} total GMs - crushing it! 💪)` },
      { threshold: 10, message: ` (${total} total GMs - getting serious! ⚡)` },
      {
        threshold: 5,
        message: ` (${total} total GMs - building momentum! 📈)`,
      },
      { threshold: 1, message: ` (${total} total GMs so far! 🎯)` },
    ];

    const milestone = milestones.find((m) => total >= m.threshold);
    return milestone?.message || "";
  };

  const randomFrom = (arr: string[]) =>
    arr[Math.floor(Math.random() * arr.length)];

  const baseMessage = claimedToday
    ? randomFrom(claimMessages)
    : randomFrom(statusMessages);
  const streakMessage = getStreakMessage(
    currentStreak,
    claimedToday || todayGM
  );
  const milestoneMessage = getMilestoneMessage(totalGMs);

  if (totalGMs === 1 && currentStreak === 1) {
    return claimedToday
      ? "🎉 Just made my very first GM claim! Welcome to the DEGEN life! 🚀"
      : "🌟 Just started my GM journey with my first GM! 💪";
  }

  if (currentStreak === 7) {
    return claimedToday
      ? "🎊 Week-long GM streak achieved! DEGEN rewards flowing! 💰"
      : "⚡ One week of consistent GMs! Who's stopping me now? 🔥";
  }

  if (currentStreak === 30) {
    return claimedToday
      ? "👑 30-day GM emperor! DEGEN rewards for the throne! 💎"
      : "🏆 30 days of pure GM dedication! Unbreakable! 🚀";
  }

  return `${baseMessage} ${streakMessage}${milestoneMessage}`;
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
