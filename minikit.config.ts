const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")

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
    subtitle: "Daily GM on Base",
    description:
      "Boost your onchain footprint and build streaks with OnePulse on Base, Celo, and Optimism",
    screenshotUrls: [`${ROOT_URL}/screenshot.png`],
    iconUrl: `${ROOT_URL}/icon.png`,
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: "#FFFFFF",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "social",
    tags: ["base", "celo", "op", "gm", "daily"],
    heroImageUrl: `${ROOT_URL}/hero.png`,
    tagline: "Based onchain booster",
    ogTitle: "OnePulse",
    ogDescription:
      "Boost your onchain footprint and build streaks with OnePulse on Base, Celo, and Optimism",
    ogImageUrl: `${ROOT_URL}/hero.png`,
    noindex: false,
  },
  baseBuilder: {
    ownerAddress: "0x0e2d4eF0a0A82cd818f0B3cfFe52F4Ebcbf0d96e",
  },
} as const
