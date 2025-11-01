const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")

const BUILD_ID =
  process.env.NEXT_PUBLIC_BUILD_ID ||
  process.env.VERCEL_GIT_COMMIT_SHA ||
  String(Date.now())

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
    screenshotUrls: [`${ROOT_URL}/screenshot.png?v=${BUILD_ID}`],
    iconUrl: `${ROOT_URL}/icon.png?v=${BUILD_ID}`,
    splashImageUrl: `${ROOT_URL}/splash.png?v=${BUILD_ID}`,
    splashBackgroundColor: "#FFFFFF",
    homeUrl: ROOT_URL,
    webhookUrl: `https://api.neynar.com/f/app/83e38474-41bd-43fb-862f-84359b7d2049/event`,
    primaryCategory: "social",
    tags: ["base", "celo", "op", "gm", "daily"],
    heroImageUrl: `${ROOT_URL}/hero.png?v=${BUILD_ID}`,
    tagline: "Based onchain booster",
    ogTitle: "OnePulse",
    ogDescription:
      "Boost your onchain footprint and build streaks with OnePulse on Base, Celo, and Optimism",
    ogImageUrl: `${ROOT_URL}/hero.png?v=${BUILD_ID}`,
    noindex: false,
  },
  baseBuilder: {
    ownerAddress: "0x0e2d4eF0a0A82cd818f0B3cfFe52F4Ebcbf0d96e",
  },
} as const
