"use client";

import { OnchainKitProvider as Provider } from "@coinbase/onchainkit";
import type { ReactNode } from "react";
import { base } from "wagmi/chains";
import { minikitConfig } from "@/minikit.config";
import "@/styles/onchainkit.css";

export function OnchainKitProvider({ children }: { children: ReactNode }) {
  return (
    <Provider
      analytics={false}
      apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
      chain={base}
      config={{
        appearance: {
          name: process.env.NEXT_PUBLIC_PROJECT_NAME,
          logo: minikitConfig.miniapp.iconUrl,
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
      }}
      projectId={process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_ID}
    >
      {children}
    </Provider>
  );
}
