"use client"

import { ReactNode } from "react"
import { OnchainKitProvider } from "@coinbase/onchainkit"
import { base } from "wagmi/chains"

import Provider from "@/components/providers/wagmiProvider"

import "@coinbase/onchainkit/styles.css"

import { ThemeProvider } from "next-themes"

import { ColorSchemeSync } from "@/components/providers/color-scheme-sync"
import { SpacetimeDBProvider } from "@/components/providers/spacetimedb-provider"

export function RootProvider({ children }: { children: ReactNode }) {
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
              mode: "auto",
              theme: "base",
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
