"use client";

import type { ReactNode } from "react";
import { WagmiProvider as Provider, type State } from "wagmi";
import { config } from "@/lib/wagmi";
import { useWagmiProviderLogic } from "./use-wagmi-provider-logic";

export function WagmiProvider({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState?: State;
}) {
  useWagmiProviderLogic();

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
