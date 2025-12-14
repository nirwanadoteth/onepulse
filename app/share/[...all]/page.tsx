import type { Metadata } from "next";
import { isAddress } from "viem";
import { SUPPORTED_CHAINS } from "@/lib/constants";
import { fetchFarcasterUser } from "@/lib/farcaster";
import { generateSimplifiedGMStatusOGUrl } from "@/lib/og-utils";
import { getGmRows } from "@/lib/spacetimedb/server-connection";
import { minikitConfig } from "@/minikit.config";

type Props = {
  params: Promise<{ all: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

function getChainName(chainId: number): string {
  return SUPPORTED_CHAINS.find((c) => c.id === chainId)?.name || "Unknown";
}

function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export type GmStatsResult = {
  chains: { name: string; count: number }[];
  allTimeGmCount: number;
  fid?: number;
};

async function fetchGmStats(address: string): Promise<GmStatsResult> {
  try {
    const rows = await getGmRows(address);
    const allTimeGmCount = rows.reduce(
      (acc, r) => acc + (r.allTimeGmCount ?? 0),
      0
    );
    const chains = rows
      .map((r) => ({
        name: getChainName(r.chainId),
        count: r.allTimeGmCount ?? 0,
      }))
      .filter((c) => c.count > 0)
      .sort((a, b) => a.name.localeCompare(b.name));

    // Find FID from rows
    const rowWithFid = rows.find((r) => r.fid);
    const fid = rowWithFid?.fid ? Number(rowWithFid.fid) : undefined;

    return { chains, allTimeGmCount, fid };
  } catch {
    return { chains: [], allTimeGmCount: 0, fid: undefined };
  }
}

async function resolveDisplayName(address: string): Promise<string> {
  if (!isAddress(address)) {
    return "Unknown User";
  }

  let displayName = formatAddress(address);
  const gmStats = await fetchGmStats(address);

  if (gmStats.fid) {
    const fcUser = await fetchFarcasterUser(Number(gmStats.fid));
    if (fcUser) {
      displayName = fcUser.displayName || fcUser.username || displayName;
    }
  }

  return displayName;
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const sp = await searchParams;
  const address = (sp.address as string) || "";

  if (!isAddress(address)) {
    return {
      title: minikitConfig.miniapp.name,
      description: minikitConfig.miniapp.description,
    };
  }

  const displayName = await resolveDisplayName(address);

  const ogImageUrl = generateSimplifiedGMStatusOGUrl({
    address,
  });

  const frame = {
    version: minikitConfig.miniapp.version,
    imageUrl: ogImageUrl,
    button: {
      title: "Open OnePulse",
      action: {
        type: "launch_frame",
        name: minikitConfig.miniapp.name,
        url: minikitConfig.miniapp.homeUrl,
        splashImageUrl: minikitConfig.miniapp.splashImageUrl,
        splashBackgroundColor: minikitConfig.miniapp.splashBackgroundColor,
      },
    },
  };

  return {
    title: `${displayName} on OnePulse`,
    description: `Check out ${displayName}'s GM stats on OnePulse`,
    openGraph: {
      images: [ogImageUrl],
    },
    other: {
      "fc:frame": JSON.stringify(frame),
      "fc:miniapp": JSON.stringify(frame),
    },
  };
}

export default async function SharePage({ searchParams }: Props) {
  const sp = await searchParams;
  const address = (sp.address as string) || "";

  const displayName = await resolveDisplayName(address);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <h1 className="mb-4 font-bold text-2xl">GM from {displayName}!</h1>
      <p className="text-muted-foreground">
        Open OnePulse to see full stats and join the movement.
      </p>
    </div>
  );
}
