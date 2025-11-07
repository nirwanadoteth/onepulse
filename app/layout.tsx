import { Metadata } from "next"
import type { Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { minikitConfig } from "@/minikit.config"
import { SafeArea } from "@coinbase/onchainkit/minikit"

import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"

import { RootProvider } from "./root-provider"

import "./globals.css"

import { cn } from "@/lib/utils"

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
})

const geist_mono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
})

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
}

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
  }
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          geist.className,
          geist_mono.className,
          "font-sans antialiased"
        )}
      >
        <RootProvider>
          <TooltipProvider delayDuration={0}>
            <SafeArea>
              <Toaster position="top-center" richColors closeButton />
              {children}
            </SafeArea>
          </TooltipProvider>
        </RootProvider>
      </body>
    </html>
  )
}
