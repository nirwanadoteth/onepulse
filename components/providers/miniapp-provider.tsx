"use client";

import type { ReactNode } from "react";
import { createContext, useContext } from "react";
import type { MiniAppContext } from "@/types/miniapp";
import { useMiniAppProviderLogic } from "./use-miniapp-provider-logic";

type MiniAppProviderContextType = {
  context: MiniAppContext | null;
  isInMiniApp: boolean;
} | null;

const MiniAppProviderContext = createContext<MiniAppProviderContextType>(null);

// Hook to consume context with graceful null handling
export function useMiniAppContext() {
  const context = useContext(MiniAppProviderContext);
  // Return safe defaults if context is not available (e.g., during prerendering)
  return (
    context ?? {
      context: null,
      isInMiniApp: false,
    }
  );
}

type MiniAppProviderProps = {
  children: ReactNode;
};

export function MiniAppProvider({ children }: MiniAppProviderProps) {
  const { miniAppContext } = useMiniAppProviderLogic();

  return (
    <MiniAppProviderContext value={miniAppContext}>
      {children}
    </MiniAppProviderContext>
  );
}
