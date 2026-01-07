"use client";

import { OnchainKitProvider as Provider } from "@coinbase/onchainkit";
import { base } from "@wagmi/core/chains";
import type { ReactNode } from "react";
import { minikitConfig } from "@/minikit.config";
import "@/styles/onchainkit.css";

type OnchainKitProviderProps = {
  children: ReactNode;
};

export function OnchainKitProvider({ children }: OnchainKitProviderProps) {
  const apiKey = process.env.ONCHAINKIT_API_KEY;
  const projectId = process.env.ONCHAINKIT_PROJECT_ID;
  const paymaster = process.env.PAYMASTER_ENDPOINT;

  const config = {
    appearance: {
      name: minikitConfig.miniapp.name,
      logo: minikitConfig.miniapp.splashImageUrl,
      mode: "auto" as const,
      theme: "custom" as const,
    },
    wallet: {
      display: "modal" as const,
      preference: "all" as const,
      supportedWallets: {
        rabby: true,
      },
    },
    paymaster,
  };

  return (
    <Provider
      apiKey={apiKey}
      chain={base}
      config={config}
      projectId={projectId}
    >
      {children}
    </Provider>
  );
}
