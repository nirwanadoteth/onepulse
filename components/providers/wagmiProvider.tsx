import { useState } from "react"
import { minikitConfig } from "@/minikit.config"
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import {
  cookieStorage,
  createConfig,
  createStorage,
  http,
  WagmiProvider,
} from "wagmi"
import { base } from "wagmi/chains"
import { baseAccount, injected } from "wagmi/connectors"

function getConfig() {
  return createConfig({
    chains: [base],
    connectors: [
      injected(),
      farcasterMiniApp(),
      baseAccount({
        appName: minikitConfig.miniapp.name,
        appLogoUrl: minikitConfig.miniapp.iconUrl,
      }),
    ],
    storage: createStorage({
      storage: cookieStorage,
    }),
    ssr: true,
    transports: {
      [base.id]: http(),
    },
  })
}

export default function Provider({ children }: { children: React.ReactNode }) {
  const [config] = useState(() => getConfig())
  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
