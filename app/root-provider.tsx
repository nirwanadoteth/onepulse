"use client";

import type { ReactNode } from "react";
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
      <SpacetimeDBProvider>
        {children}
        <Toaster
          className="flex justify-center"
          duration={2000}
          position="top-center"
          visibleToasts={1}
        />
      </SpacetimeDBProvider>
    </OnchainKitProvider>
  );
}
