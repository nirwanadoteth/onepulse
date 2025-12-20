import type { Metadata } from "next";
import { isAddress } from "viem";
import { z } from "zod";
import { SUPPORTED_CHAINS } from "@/lib/constants";
import { fetchFarcasterUser } from "@/lib/farcaster";
import { generateSimplifiedGMStatusOGUrl } from "@/lib/og-utils";
import { getGmRows } from "@/lib/spacetimedb/server-connection";
import { minikitConfig } from "@/minikit.config";

type Props = {
  params: Promise<{ all: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const sharePageQuerySchema = z.object({
  address: z
    .string()
    .nullish()
    .refine((addr) => !addr || isAddress(addr), {
      message: "Invalid Ethereum address",
    })
    .transform((addr) => addr || null),
});

function getChainName(chainId: number): string {
  return SUPPORTED_CHAINS.find((c) => c.id === chainId)?.name || "Unknown";
}

function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export type GmStatsResult = {
  stats: Record<
    string,
    {
      name: string;
      currentStreak: number;
      highestStreak: number;
      allTimeGmCount: number;
    }
  >;
  fid?: number;
};

async function fetchGmStats(address: string): Promise<GmStatsResult> {
  try {
    const rows = await getGmRows(address);
    const stats: Record<
      string,
      {
        name: string;
        currentStreak: number;
        highestStreak: number;
        allTimeGmCount: number;
      }
    > = {};

    for (const r of rows) {
      stats[String(r.chainId)] = {
        name: getChainName(r.chainId),
        currentStreak: r.currentStreak ?? 0,
        highestStreak: r.highestStreak ?? 0,
        allTimeGmCount: r.allTimeGmCount ?? 0,
      };
    }

    // Find FID from rows
    const rowWithFid = rows.find((r) => r.fid);
    const fid = rowWithFid?.fid ? Number(rowWithFid.fid) : undefined;

    return { stats, fid };
  } catch {
    return { stats: {}, fid: undefined };
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

  const parseResult = sharePageQuerySchema.safeParse({
    address: sp.address,
  });

  const defaultMetadata = {
    title: minikitConfig.miniapp.name,
    description: minikitConfig.miniapp.description,
  };

  if (!parseResult.success) {
    return defaultMetadata;
  }

  const address = parseResult.data.address;

  if (!address) {
    return defaultMetadata;
  }

  const displayName = await resolveDisplayName(address as string);

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
      "base:app_id": "69023f41aa8286a3a56039a9",
      "fc:frame": JSON.stringify(frame),
      "fc:miniapp": JSON.stringify(frame),
    },
  };
}

export default async function SharePage({ searchParams }: Props) {
  const sp = await searchParams;

  const parseResult = sharePageQuerySchema.safeParse({
    address: sp.address,
  });

  const errorUI = (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <h1 className="mb-4 font-bold text-2xl">Invalid Address</h1>
      <p className="text-muted-foreground">
        Please provide a valid Ethereum address.
      </p>
    </div>
  );

  if (!parseResult.success) {
    return errorUI;
  }

  const address = parseResult.data.address;

  if (!address) {
    return errorUI;
  }

  const displayName = await resolveDisplayName(address as string);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <h1 className="mb-4 font-bold text-2xl">GM from {displayName}!</h1>
      <p className="text-muted-foreground">
        Open OnePulse to see full stats and join the movement.
      </p>
    </div>
  );
}
