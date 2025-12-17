/**
 * Generate share text based on reward status and multichain activity.
 */

export function getShareText(
  claimedReward: boolean,
  completedAllChains: boolean
): string {
  if (completedAllChains) {
    return "I just completed Daily GM on OnePulse across all chains!\n\nMultichain rewards unlocked 🎯";
  }

  if (claimedReward) {
    return "I just claimed daily rewards on OnePulse!\n\nSend GM and get rewarded.";
  }

  return "Check out my stats on OnePulse - earning across multiple chains!";
}
