/**
 * Simplified share text generation.
 */

export function getShareText(
  claimedReward: boolean,
  completedAllChains: boolean
): string {
  if (completedAllChains) {
    return "I just sent GM on all chains with @onepulse! 🌍✨\n\nCan you keep up the streak? Join us and start your daily GM journey now! 🚀";
  }

  if (claimedReward) {
    return "I just claimed my daily rewards on @onepulse! 💸✨\n\nDon't miss out—start your streak and earn today! 🚀";
  }

  return "Just checking in on @onepulse! ⚡️\n\nJoin the community, send your daily GM, and start earning rewards! 🚀";
}
