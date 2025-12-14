import { minikitConfig } from "@/minikit.config";

type ShareParams = {
  username?: string;
  displayName?: string;
  pfp?: string;
  chains?: { name: string; count: number }[];
};

type ShareParamsSimplified = {
  address: string;
};

function buildSearchParams(params: ShareParams): URLSearchParams {
  const searchParams = new URLSearchParams();

  if (params.username) {
    searchParams.set("username", params.username);
  }
  if (params.displayName) {
    searchParams.set("displayName", params.displayName);
  }
  if (params.pfp) {
    searchParams.set("pfp", params.pfp);
  }

  if (params.chains) {
    const chainsStr = params.chains
      .map((c) => `${encodeURIComponent(c.name)}:${c.count}`)
      .join(",");
    searchParams.set("chains", chainsStr);
  }

  return searchParams;
}

function buildSimplifiedSearchParams(
  params: ShareParamsSimplified
): URLSearchParams {
  const searchParams = new URLSearchParams();
  searchParams.set("address", params.address);
  return searchParams;
}

export function generateGMStatusOGUrl(params: ShareParams): string {
  return `${minikitConfig.miniapp.homeUrl}/api/og?${buildSearchParams(params)}`;
}

export function generateSimplifiedGMStatusOGUrl(
  params: ShareParamsSimplified
): string {
  return `${minikitConfig.miniapp.homeUrl}/api/og?${buildSimplifiedSearchParams(params)}`;
}

export function generateSharePageUrl(params: ShareParams): string {
  return `${minikitConfig.miniapp.homeUrl}/share/view?${buildSearchParams(params)}`;
}

export function generateSimplifiedSharePageUrl(
  params: ShareParamsSimplified
): string {
  return `${minikitConfig.miniapp.homeUrl}/share/view?${buildSimplifiedSearchParams(params)}`;
}
