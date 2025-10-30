"use client"

import { useEffect } from "react"
import { minikitConfig } from "@/minikit.config"
import { sdk } from "@farcaster/miniapp-sdk"
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector"
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi"
import { base, celo, optimism } from "@reown/appkit/networks"
import { createAppKit } from "@reown/appkit/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import {
  cookieStorage,
  cookieToInitialState,
  CreateConnectorFn,
  createStorage,
  http,
  useAccount,
  useConnect,
  WagmiProvider,
  type Config,
} from "wagmi"
import { baseAccount, injected } from "wagmi/connectors"

const queryClient = new QueryClient()

export const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID

if (!projectId) {
  throw new Error("Project ID is not defined")
}

export const networks = [base, celo, optimism]

const connectors: CreateConnectorFn[] = [
  // Prefer Farcaster connector when inside Farcaster Mini App
  farcasterMiniApp(),
  injected(),
  baseAccount({
    appName: minikitConfig.miniapp.name,
    appLogoUrl: minikitConfig.miniapp.iconUrl,
  }),
]

const metadata = {
  name: minikitConfig.miniapp.name,
  description: minikitConfig.miniapp.name,
  url: minikitConfig.miniapp.homeUrl,
  icons: [minikitConfig.miniapp.iconUrl],
}

export const wagmiAdapter = new WagmiAdapter({
  chains: [base, celo, optimism],
  connectors,
  projectId,
  networks,
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  transports: {
    [base.id]: http(),
    [celo.id]: http(),
    [optimism.id]: http(),
  },
})

/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [base, celo, optimism],
  defaultNetwork: base,
  metadata: metadata,
  featuredWalletIds: [
    "fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa",
  ],
  allWallets: "ONLY_MOBILE",
})

export default function Provider({
  children,
  cookies,
}: {
  children: React.ReactNode
  cookies: string | null
}) {
  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig as Config,
    cookies
  )

  return (
    <WagmiProvider
      config={wagmiAdapter.wagmiConfig as Config}
      initialState={initialState}
    >
      <QueryClientProvider client={queryClient}>
        <AutoConnectOnMiniApp />
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}

function AutoConnectOnMiniApp() {
  const { isConnected } = useAccount()
  const { connect, connectors: availableConnectors } = useConnect()

  useEffect(() => {
    try {
      const isMini = Boolean(
        (sdk as unknown as { isMiniApp?: boolean })?.isMiniApp
      )
      if (!isConnected && isMini) {
        const fc = availableConnectors.find((c) => {
          const id = (c as unknown as { id?: string }).id
          const name = c.name
          const key = String(id ?? name).toLowerCase()
          return key.includes("farcaster")
        })
        if (fc) {
          connect({ connector: fc })
        }
      }
    } catch {
      // ignore
    }
  }, [isConnected, connect, availableConnectors])

  return null
}
