const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');

/**
 * MiniApp configuration object. Must follow the Farcaster MiniApp specification.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */
export const minikitConfig = {
  accountAssociation: {
    header: "",
    payload: "",
    signature: ""
  },
  miniapp: {
    version: "1",
    name: "OnePulse",
    subtitle: "Daily GM Community",
    description: "Build streaks and connect with the community through daily GM interactions on Base blockchain",
    screenshotUrls: [`${ROOT_URL}/screenshot-portrait.png`],
    iconUrl: `${ROOT_URL}/onepulse-icon.png`,
    imageUrl: `${ROOT_URL}/onepulse-hero.png`,
    buttonTitle: "Send GM",
    splashImageUrl: `${ROOT_URL}/onepulse-hero.png`,
    splashBackgroundColor: "#000000",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "social",
    tags: ["base", "baseapp", "miniapp", "gm", "daily"],
    heroImageUrl: `${ROOT_URL}/onepulse-hero.png`,
    tagline: "One GM at a time",
    ogTitle: "OnePulse - Daily GM Community",
    ogDescription: "Build your streak and connect with the community through daily GM interactions",
    ogImageUrl: `${ROOT_URL}/onepulse-hero.png`,
    noindex: false
  },
  baseBuilder: {
    ownerAddress: "0x0e2d4eF0a0A82cd818f0B3cfFe52F4Ebcbf0d96e",
    allowedAddresses: [
      "0xf68da68C7894b62aaA893D49F3B119177C98dE69",
      "0x5cbEEB487a6F7a65E480a38fff7b4537a8D1C874",
      "0x0e2d4eF0a0A82cd818f0B3cfFe52F4Ebcbf0d96e"
    ]
  }
} as const;

