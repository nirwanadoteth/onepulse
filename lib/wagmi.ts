import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";
import { baseAccount, injected } from "@wagmi/connectors";
import {
  type Config,
  cookieStorage,
  createConfig,
  createStorage,
  http,
} from "@wagmi/core";
import { base } from "@wagmi/core/chains";
import { createClient } from "viem";
import { minikitConfig } from "@/minikit.config";

export const config: Config = createConfig({
  chains: [base],
  connectors: [
    farcasterMiniApp(),
    baseAccount({
      appName: minikitConfig.miniapp.name,
      appLogoUrl: minikitConfig.miniapp.iconUrl,
      preference: {
        appChainIds: [base.id],
        telemetry: false,
      },
    }),
    injected(),
  ],
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  client({ chain }) {
    return createClient({ chain, transport: http() });
  },
});

declare module "wagmi" {
  // biome-ignore lint/style/useConsistentTypeDefinitions: this is how wagmi defines it
  interface Register {
    config: typeof config;
  }
}
