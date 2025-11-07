"use client"

import { type ReactNode } from "react"
import { OnchainKitProvider } from "@coinbase/onchainkit"
import { ThemeProvider } from "next-themes"
import { base } from "wagmi/chains"

import { ColorSchemeSync } from "@/components/providers/color-scheme-sync"
import { SpacetimeDBProvider } from "@/components/providers/spacetimedb-provider"
import Provider from "@/components/providers/wagmi-provider"

import "./onchainkit.css"

export function RootProvider({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="theme"
    >
      <Provider>
        <OnchainKitProvider
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
          projectId={process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_ID!}
          chain={base}
          config={{
            appearance: {
              name: process.env.NEXT_PUBLIC_PROJECT_NAME,
              logo: `${process.env.NEXT_PUBLIC_URL}/logo.png`,
              mode: "auto",
              theme: "custom",
            },
            wallet: {
              display: "modal",
              preference: "all",
              supportedWallets: {
                rabby: true,
                trust: true,
                frame: true,
              },
            },
            paymaster: process.env.PAYMASTER_ENDPOINT,
          }}
          miniKit={{
            enabled: true,
            autoConnect: true,
            notificationProxyUrl: undefined,
          }}
        >
          <ColorSchemeSync />
          <SpacetimeDBProvider>{children}</SpacetimeDBProvider>
        </OnchainKitProvider>
      </Provider>
    </ThemeProvider>
  )
}
