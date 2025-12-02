import type { Metadata } from "next";
import { generateGMStatusOGUrl } from "@/lib/og-utils";
import { minikitConfig } from "@/minikit.config";

type Props = {
  params: Promise<{ all: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

function parseChains(chainsParam: string | string[] | undefined) {
  if (typeof chainsParam !== "string") {
    return;
  }
  return chainsParam.split(",").map((c) => {
    const [name, count] = c.split(":");
    return {
      name: name ? decodeURIComponent(name) : "Unknown",
      count: Number.parseInt(count || "0", 10),
    };
  });
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const sp = await searchParams;
  const username = (sp.username as string) || "User";
  const displayName = (sp.displayName as string) || username;
  const pfp = (sp.pfp as string) || null;
  const chains = parseChains(sp.chains);

  const ogImageUrl = generateGMStatusOGUrl({
    username,
    displayName,
    pfp: pfp || undefined,
    chains,
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
    title: minikitConfig.miniapp.name,
    description: minikitConfig.miniapp.description,
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
  const username = (sp.username as string) || "User";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <h1 className="mb-4 font-bold text-2xl">GM from {username}!</h1>
      <p className="text-muted-foreground">
        Open OnePulse to see full stats and join the movement.
      </p>
    </div>
  );
}
