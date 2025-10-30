"use client"

import { ReactNode } from "react"
import { OnchainKitProvider } from "@coinbase/onchainkit"
import { base } from "wagmi/chains"

import Provider from "@/components/providers/wagmiProvider"

import "@coinbase/onchainkit/styles.css"

import { ThemeProvider } from "next-themes"

export function RootProvider({
  children,
  cookies,
}: {
  children: ReactNode
  cookies: string | null
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="theme"
    >
      <Provider cookies={cookies}>
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
          {children}
        </OnchainKitProvider>
      </Provider>
    </ThemeProvider>
  )
}
