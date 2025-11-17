import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/ui/sonner";
import { minikitConfig } from "@/minikit.config";
import { RootProvider } from "./root-provider";

import "@/styles/globals.css";

import { headers } from "next/headers";
import type { ReactNode } from "react";
import { cookieToInitialState } from "wagmi";
import { fontVariables } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { config } from "@/lib/wagmi";

const frame = {
  version: minikitConfig.miniapp.version,
  imageUrl: minikitConfig.miniapp.heroImageUrl,
  button: {
    title: "GM on Base",
    action: {
      type: "launch_frame",
      name: minikitConfig.miniapp.name,
      splashImageUrl: minikitConfig.miniapp.splashImageUrl,
      splashBackgroundColor: minikitConfig.miniapp.splashBackgroundColor,
    },
  },
};

export const revalidate = 300;

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
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const initialState = cookieToInitialState(
    config,
    (await headers()).get("cookie")
  );
  return (
    <html
      className="no-scrollbar layout-fixed"
      lang="en"
      suppressHydrationWarning
    >
      <body
        className={cn(
          "flex min-h-screen flex-col overscroll-none font-sans antialiased",
          fontVariables
        )}
      >
        <RootProvider initialState={initialState}>
          {children}
          <Toaster closeButton position="top-center" theme="system" />
        </RootProvider>
      </body>
    </html>
  );
}
