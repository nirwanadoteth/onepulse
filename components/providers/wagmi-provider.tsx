"use client";

import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { base, celo, optimism } from "viem/chains";
import {
  cookieStorage,
  createConfig,
  createStorage,
  http,
  injected,
  WagmiProvider as Provider,
  type State,
} from "wagmi";
import { baseAccount } from "wagmi/connectors";
import { minikitConfig } from "@/minikit.config";

export const config = createConfig({
  chains: [base, celo, optimism],
  connectors: [
    farcasterMiniApp(),
    baseAccount({
      appName: minikitConfig.miniapp.name,
      appLogoUrl: minikitConfig.miniapp.iconUrl,
      preference: {
        telemetry: false,
      },
    }),
    injected(),
  ],
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  transports: {
    [base.id]: http(),
    [celo.id]: http(),
    [optimism.id]: http(),
  },
});

export function WagmiProvider({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState?: State;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <Provider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Provider>
  );
}
