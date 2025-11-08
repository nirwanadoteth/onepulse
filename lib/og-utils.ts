/**
 * Generate OG image URL for GM status sharing
 */
export function generateGMStatusOGUrl(params: {
  username?: string
  streak?: number
  totalGMs?: number
  chains?: string[]
  todayGM?: boolean
  claimedToday?: boolean
}): string {
  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000"
  const searchParams = new URLSearchParams()

  // Define parameter mappings to reduce conditional complexity
  const paramMappings = [
    { key: "username", value: params.username },
    { key: "streak", value: params.streak?.toString() },
    { key: "totalGMs", value: params.totalGMs?.toString() },
    {
      key: "chains",
      value: params.chains?.length ? params.chains.join(",") : undefined,
    },
    { key: "todayGM", value: params.todayGM?.toString() },
    { key: "claimedToday", value: params.claimedToday?.toString() },
  ]

  paramMappings.forEach(({ key, value }) => {
    if (value !== undefined) {
      searchParams.set(key, value)
    }
  })

  return `${baseUrl}/api/og/gm-status?${searchParams.toString()}`
}

/**
 * Generate metadata for sharing GM status
 */
export function generateGMStatusMetadata(params: {
  username?: string
  streak?: number
  totalGMs?: number
  chains?: string[]
  todayGM?: boolean
  claimedToday?: boolean
}) {
  const imageUrl = generateGMStatusOGUrl(params)
  const username = params.username || "Anonymous"
  const streak = params.streak || 0
  const claimedToday = params.claimedToday || false

  const achievementText = claimedToday
    ? `just claimed their daily DEGEN rewards!`
    : `is on a ${streak}-day GM streak`

  return {
    title: `${username}'s GM Achievement`,
    description: `${username} ${achievementText}. Join the daily GM movement with OnePulse!`,
    image: imageUrl,
    url: process.env.NEXT_PUBLIC_URL || "http://localhost:3000",
  }
}
