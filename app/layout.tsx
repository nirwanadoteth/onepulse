import { Geist, Geist_Mono } from "next/font/google"
import { SafeArea } from "@coinbase/onchainkit/minikit"

import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"

import { minikitConfig } from "../minikit.config"
import { RootProvider } from "./rootProvider"

import "./globals.css"

const frame = {
  version: minikitConfig.miniapp.version,
  imageUrl: minikitConfig.miniapp.heroImageUrl,
  button: {
    title: "GM on Base",
    action: {
      type: "launch_frame",
      name: `${minikitConfig.miniapp.name}`,
      url: minikitConfig.miniapp.homeUrl,
      splashImageUrl: minikitConfig.miniapp.splashImageUrl,
      splashBackgroundColor: minikitConfig.miniapp.splashBackgroundColor,
    },
  },
}

export async function generateMetadata() {
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
      "fc:miniapp:subtitle": minikitConfig.miniapp.subtitle,
      "fc:miniapp:description": minikitConfig.miniapp.description,
      "fc:miniapp:tags": JSON.stringify(minikitConfig.miniapp.tags),
      "fc:miniapp:tagline": minikitConfig.miniapp.tagline,
      "fc:miniapp:og:title": minikitConfig.miniapp.ogTitle,
      "fc:miniapp:og:description": minikitConfig.miniapp.ogDescription,
    },
  }
}

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} ${geistMono.variable} antialiased`}>
        <RootProvider>
          <TooltipProvider delayDuration={0}>
            <SafeArea>{children}</SafeArea>
          </TooltipProvider>
          <Toaster
            position="top-center"
            richColors
            closeButton
            toastOptions={{
              actionButtonStyle: {
                background: "transparent",
                border: "none",
                padding: 0,
                color: "var(--primary)",
                boxShadow: "none",
                textDecoration: "none",
              },
            }}
          />
        </RootProvider>
      </body>
    </html>
  )
}
