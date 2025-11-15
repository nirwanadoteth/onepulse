const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

/**
 * MiniApp configuration object. Must follow the Farcaster MiniApp specification.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */
export const minikitConfig = {
  accountAssociation: {
    header:
      "eyJmaWQiOjk5OTg4MywidHlwZSI6ImF1dGgiLCJrZXkiOiIweDVjYkVFQjQ4N2E2RjdhNjVFNDgwYTM4ZmZmN2I0NTM3YThEMUM4NzQifQ",
    payload: "eyJkb21haW4iOiJvbmVwdWxzZS1ydWJ5LnZlcmNlbC5hcHAifQ",
    signature:
      "CpV5sYPxQjee7lJ4YzNlLlBK4976XwWYSxr0Qr7eGABbWqeeMxbe4Szceu/DHXuSXuNMZKTlJHIZAVhGSyIO+Rs=",
  },
  miniapp: {
    version: "1",
    name: "OnePulse",
    subtitle: "Say GM, earn rewards",
    description: "Build streaks and get rewarded",
    screenshotUrls: [`${ROOT_URL}/screenshot.png`],
    iconUrl: `${ROOT_URL}/icon-dark.png`,
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: "#FFFFFF",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "social",
    tags: ["daily", "gm", "habit", "rewards", "streaks"],
    heroImageUrl: `${ROOT_URL}/hero.png`,
    tagline: "Your daily onchain habit",
    ogTitle: "OnePulse",
    ogDescription: "Build streaks and get rewarded",
    ogImageUrl: `${ROOT_URL}/hero.png`,
    noindex: false,
  },
  baseBuilder: {
    ownerAddress: "0x0e2d4eF0a0A82cd818f0B3cfFe52F4Ebcbf0d96e",
  },
} as const;
