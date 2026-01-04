"use client";

import { SafeArea } from "@coinbase/onchainkit/minikit";
import type { ReactNode } from "react";
import { MiniAppProvider } from "@/components/providers/miniapp-provider";
import { OnchainKitProvider } from "@/components/providers/onchainkit-provider";
import { SpacetimeDBProvider } from "@/components/providers/spacetimedb-provider";
import { Toaster } from "@/components/ui/sonner";

export function RootProvider({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <OnchainKitProvider>
      <MiniAppProvider>
        <SpacetimeDBProvider>
          <SafeArea>
            {children}
            <Toaster
              className="flex justify-center"
              duration={2000}
              position="top-center"
              visibleToasts={1}
            />
          </SafeArea>
        </SpacetimeDBProvider>
      </MiniAppProvider>
    </OnchainKitProvider>
  );
}
