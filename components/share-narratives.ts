/**
 * Generate share text based on reward status and multichain activity.
 */

export function getShareText(
  claimedReward: boolean,
  completedAllChains: boolean
): string {
  if (completedAllChains) {
    return "I just completed my Daily GM on OnePulse across all chains!\n\nBuilding streaks and earning rewards every single day.\n\nby @nirwana.eth";
  }

  if (claimedReward) {
    return "I just claimed my daily rewards on OnePulse!\n\nSay GM, build streaks, get rewarded. Join me.\n\nby @nirwana.eth";
  }

  return "Earning daily rewards on OnePulse across multiple blockchains. Come say GM with me.\n\nby @nirwana.eth";
}

/**
 * Backward compatible version without additional options
 */
export function getSimpleShareText(
  claimedReward: boolean,
  completedAllChains: boolean
): string {
  return getShareText(claimedReward, completedAllChains);
}
