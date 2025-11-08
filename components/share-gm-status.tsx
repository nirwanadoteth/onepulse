"use client"

import React from "react"
import {
  useComposeCast,
  useMiniKit,
  useOpenUrl,
} from "@coinbase/onchainkit/minikit"
import { Copy, MessageCircle } from "lucide-react"

import { generateGMStatusMetadata } from "@/lib/og-utils"
import { useGmStats } from "@/hooks/use-gm-stats"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"

interface ShareGMStatusProps {
  className?: string
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  claimedToday?: boolean
}

// Utility functions for GM sharing
const getUsername = (
  context: { user?: { username?: string; displayName?: string } } | null
) => context?.user?.username || context?.user?.displayName || "Anonymous"

const getGMStats = (
  gmStats: { currentStreak?: number; allTimeGmCount?: number } | undefined
) => ({
  currentStreak: gmStats?.currentStreak || 0,
  totalGMs: gmStats?.allTimeGmCount || 0,
})

const hasGMedToday = (gmStats: { lastGmDay?: number } | undefined) => {
  if (!gmStats?.lastGmDay) return false
  const today = Math.floor(new Date().getTime() / (1000 * 60 * 60 * 24))
  return gmStats.lastGmDay === today
}

const createShareText = (claimedToday: boolean, currentStreak: number) => {
  const baseText = claimedToday
    ? "Just claimed my daily DEGEN rewards!"
    : "Check out my GM status!"

  if (currentStreak > 0) {
    const streakType = claimedToday ? "GM streak" : "streak"
    return `${baseText} ${currentStreak}-day ${streakType} 🔥`
  }
  return `${baseText} Starting my GM journey!`
}

const createShareMetadata = (
  username: string,
  currentStreak: number,
  totalGMs: number,
  todayGM: boolean,
  claimedToday: boolean
) => {
  return generateGMStatusMetadata({
    username,
    streak: currentStreak,
    totalGMs,
    chains: ["Base"],
    todayGM,
    claimedToday,
  })
}

// Custom hook for GM sharing logic
function useGMSharing(claimedToday: boolean) {
  const { context } = useMiniKit()
  const { stats: gmStats } = useGmStats()
  const { composeCast } = useComposeCast()
  const openUrl = useOpenUrl()

  const username = getUsername(context)
  const { currentStreak, totalGMs } = getGMStats(gmStats)
  const todayGM = hasGMedToday(gmStats)

  const shareText = createShareText(claimedToday, currentStreak)
  const metadata = createShareMetadata(
    username,
    currentStreak,
    totalGMs,
    todayGM,
    claimedToday
  )

  return {
    shareText,
    shareUrl: metadata.url,
    composeCast,
    openUrl,
  }
}

// Platform-specific sharing functions
const shareToTwitter = (
  shareText: string,
  shareUrl: string,
  openUrl: (url: string) => void
) => {
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareText
  )}&url=${encodeURIComponent(shareUrl)}`
  openUrl(twitterUrl)
}

const shareToCast = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  composeCast: any,
  shareText: string,
  shareUrl: string
) => {
  try {
    await composeCast({
      text: `${shareText}`,
      embeds: [shareUrl],
    })
  } catch (error) {
    console.error("Failed to compose cast:", error)
    // Fallback to clipboard
    navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
  }
}

const shareToClipboard = (shareText: string, shareUrl: string) => {
  const fullText = `${shareText}\n\n${shareUrl}`
  navigator.clipboard.writeText(fullText)
}

export function ShareGMStatus({
  className,
  variant = "outline",
  size = "default",
  claimedToday = false,
}: ShareGMStatusProps) {
  const { shareText, shareUrl, composeCast, openUrl } =
    useGMSharing(claimedToday)

  const handleShare = async (platform: "twitter" | "cast" | "copy") => {
    switch (platform) {
      case "twitter":
        shareToTwitter(shareText, shareUrl, openUrl)
        break
      case "cast":
        await shareToCast(composeCast, shareText, shareUrl)
        break
      case "copy":
        shareToClipboard(shareText, shareUrl)
        break
    }
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      <Button
        variant={variant}
        size={size}
        onClick={() => handleShare("twitter")}
        className="flex-1"
      >
        <Icons.twitter className="mr-2 h-4 w-4" />
        Twitter
      </Button>
      <Button
        variant={variant}
        size={size}
        onClick={() => handleShare("cast")}
        className="flex-1"
      >
        <MessageCircle className="mr-2 h-4 w-4" />
        Cast
      </Button>
      <Button
        variant={variant}
        size={size}
        onClick={() => handleShare("copy")}
        className="flex-1"
      >
        <Copy className="mr-2 h-4 w-4" />
        Copy
      </Button>
    </div>
  )
}
