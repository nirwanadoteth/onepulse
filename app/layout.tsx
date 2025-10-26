import { Geist, Geist_Mono } from "next/font/google"
import { SafeArea } from "@coinbase/onchainkit/minikit"

import { minikitConfig } from "../minikit.config"
import { RootProvider } from "./rootProvider"

import "./globals.css"

const frame = {
  version: minikitConfig.miniapp.version,
  imageUrl: minikitConfig.miniapp.heroImageUrl,
  button: {
    title: minikitConfig.miniapp.buttonTitle,
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
    title: minikitConfig.miniapp.name,
    description: minikitConfig.miniapp.description,
    openGraph: {
      title: minikitConfig.miniapp.name,
      description: minikitConfig.miniapp.description,
      images: [minikitConfig.miniapp.heroImageUrl],
      url: minikitConfig.miniapp.homeUrl,
      siteName: minikitConfig.miniapp.name,
    },
    other: {
      "fc:frame": JSON.stringify(frame),
      "fc:miniapp": JSON.stringify(frame),
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
      <body className={`${geist.variable} ${geistMono.variable}`}>
        <RootProvider>
          <SafeArea>{children}</SafeArea>
        </RootProvider>
      </body>
    </html>
  )
}
