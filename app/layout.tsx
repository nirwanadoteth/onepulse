import type { Metadata, Viewport } from "next";
import { minikitConfig } from "@/minikit.config";
import { RootProvider } from "./root-provider";

import "@/styles/globals.css";

import type { ReactNode } from "react";
import { preconnect } from "react-dom";
import { fontVariables } from "@/lib/fonts";
import { cn } from "@/lib/utils";

const frame = {
  version: minikitConfig.miniapp.version,
  imageUrl: minikitConfig.miniapp.heroImageUrl,
  button: {
    title: "Open OnePulse",
    action: {
      type: "launch_frame",
      name: minikitConfig.miniapp.name,
      splashImageUrl: minikitConfig.miniapp.splashImageUrl,
      splashBackgroundColor: minikitConfig.miniapp.splashBackgroundColor,
    },
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: minikitConfig.miniapp.ogTitle || minikitConfig.miniapp.name,
    description:
      minikitConfig.miniapp.ogDescription || minikitConfig.miniapp.description,
    openGraph: {
      title: minikitConfig.miniapp.ogTitle || minikitConfig.miniapp.name,
      description:
        minikitConfig.miniapp.ogDescription ||
        minikitConfig.miniapp.description,
      images: [minikitConfig.miniapp.heroImageUrl],
      url: minikitConfig.miniapp.homeUrl,
      siteName: minikitConfig.miniapp.name,
    },
    twitter: {
      card: "summary_large_image",
      title: minikitConfig.miniapp.ogTitle || minikitConfig.miniapp.name,
      description:
        minikitConfig.miniapp.ogDescription ||
        minikitConfig.miniapp.description,
      images: [minikitConfig.miniapp.heroImageUrl],
    },
    other: {
      "fc:frame": JSON.stringify(frame),
      "fc:miniapp": JSON.stringify(frame),
      "base:app_id": "69023f41aa8286a3a56039a9",
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  preconnect("https://auth.farcaster.xyz");
  preconnect("wss://maincloud.spacetimedb.com");

  return (
    <html className="no-scrollbar layout-fixed" lang="en">
      <body
        className={cn(
          "flex min-h-screen flex-col overscroll-none font-sans antialiased",
          fontVariables
        )}
        cz-shortcut-listen="true"
      >
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
