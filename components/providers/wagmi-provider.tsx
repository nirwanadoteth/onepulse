"use client";

import { base } from "@reown/appkit/networks";
import { createAppKit } from "@reown/appkit/react";
import type { ReactNode } from "react";
import { WagmiProvider as Provider, type State } from "wagmi";
import { config, networks, projectId, wagmiAdapter } from "@/lib/wagmi";
import { minikitConfig } from "@/minikit.config";

const metadata = {
  name: minikitConfig.miniapp.name,
  description: minikitConfig.miniapp.description,
  url: minikitConfig.miniapp.homeUrl,
  icons: [minikitConfig.miniapp.splashImageUrl],
};

export const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  metadata,
  defaultNetwork: base,
  featuredWalletIds: [
    "fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa",
    "18388be9ac2d02726dbac9777c96efaac06d744b2f6d580fccdd4127a6d01fd1",
    "d01c7758d741b363e637a817a09bcf579feae4db9f5bb16f599fdd1f66e2f974",
    "ecc4036f814562b41a5268adc86270fba1365471402006302e70169465b7ac18",
  ],
  allowUnsupportedChain: false,
});

export function WagmiProvider({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState?: State;
}) {
  return (
    <Provider
      config={config}
      initialState={initialState}
      reconnectOnMount={false}
    >
      {children}
    </Provider>
  );
}
