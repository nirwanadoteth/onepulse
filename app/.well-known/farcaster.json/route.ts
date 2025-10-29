import { minikitConfig } from "@/minikit.config"

function withValidProperties(
  properties: Record<string, undefined | boolean | string | string[]>
) {
  return Object.fromEntries(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Object.entries(properties).filter(([key, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0
      }
      return !!value
    })
  )
}

export async function GET() {
  const body = {
    accountAssociation: {
      header: minikitConfig.accountAssociation.header,
      payload: minikitConfig.accountAssociation.payload,
      signature: minikitConfig.accountAssociation.signature,
    },
    baseBuilder: {
      ownerAddress: minikitConfig.baseBuilder.ownerAddress,
    },
    miniapp: withValidProperties({
      version: minikitConfig.miniapp.version,
      name: minikitConfig.miniapp.name,
      homeUrl: minikitConfig.miniapp.homeUrl,
      iconUrl: minikitConfig.miniapp.iconUrl,
      splashImageUrl: minikitConfig.miniapp.splashImageUrl,
      splashBackgroundColor: minikitConfig.miniapp.splashBackgroundColor,
      webhookUrl: minikitConfig.miniapp.webhookUrl,
      subtitle: minikitConfig.miniapp.subtitle,
      description: minikitConfig.miniapp.description,
      screenshotUrls: [...minikitConfig.miniapp.screenshotUrls],
      primaryCategory: minikitConfig.miniapp.primaryCategory,
      tags: [...minikitConfig.miniapp.tags],
      heroImageUrl: minikitConfig.miniapp.heroImageUrl,
      tagline: minikitConfig.miniapp.tagline,
      ogTitle: minikitConfig.miniapp.ogTitle,
      ogDescription: minikitConfig.miniapp.ogDescription,
      ogImageUrl: minikitConfig.miniapp.ogImageUrl,
    }),
  }
  return Response.json(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      // Strongly discourage intermediaries and clients from caching the manifest
      "Cache-Control":
        "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0",
    },
  })
}
