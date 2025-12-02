/**
 * Simplified share text generation.
 */

export function getShareText(
  claimedReward: boolean,
  completedAllChains: boolean
): string {
  if (completedAllChains) {
    return "I just completed Daily GM on OnePulse!\n\nStart your streak now!";
  }

  if (claimedReward) {
    return "I just claimed 10 $DEGEN on OnePulse!\n\nSend GM and get rewarded.";
  }

  return "Check out my stats on OnePulse";
}
