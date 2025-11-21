"use client";

import type { ReactNode } from "react";
import type { State } from "wagmi";
import { ColorSchemeSync } from "@/components/providers/color-scheme-sync";
import { MiniAppProvider } from "@/components/providers/miniapp-provider";
import { OnchainKitProvider } from "@/components/providers/onchainkit-provider";
import QueryClientProvider from "@/components/providers/query-client-provider";
import { SpacetimeDBProvider } from "@/components/providers/spacetimedb-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { WagmiProvider } from "@/components/providers/wagmi-provider";
import { SafeAreaProvider } from "@/components/safe-area-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

export function RootProvider({
  children,
  initialState,
}: Readonly<{
  children: ReactNode;
  initialState?: State;
}>) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="theme"
    >
      <WagmiProvider initialState={initialState}>
        <QueryClientProvider>
          <OnchainKitProvider>
            <MiniAppProvider>
              <SpacetimeDBProvider>
                <SafeAreaProvider>
                  <TooltipProvider delayDuration={0}>
                    {children}
                  </TooltipProvider>
                  <ColorSchemeSync />
                </SafeAreaProvider>
              </SpacetimeDBProvider>
            </MiniAppProvider>
          </OnchainKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}
