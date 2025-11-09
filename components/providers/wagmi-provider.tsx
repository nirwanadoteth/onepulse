"use client";

import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { base, celo, optimism } from "viem/chains";
import {
  cookieStorage,
  createConfig,
  createStorage,
  http,
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
    }),
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
  children: React.ReactNode;
  initialState?: State;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <Provider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Provider>
  );
}
