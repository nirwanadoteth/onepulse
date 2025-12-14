"use client";

import { createContext, type ReactNode, useContext } from "react";
import type { MiniAppContext } from "@/types/miniapp";
import { useMiniAppProviderLogic } from "./use-miniapp-provider-logic";

export type * from "@/types/miniapp";

type MiniAppProviderContextType = {
  context: MiniAppContext | null;
  isInMiniApp: boolean;
} | null;

const MiniAppProviderContext = createContext<MiniAppProviderContextType>(null);

export const useMiniAppContext = () => useContext(MiniAppProviderContext);

export function MiniAppProvider({ children }: { children: ReactNode }) {
  const { miniAppContext } = useMiniAppProviderLogic();

  return (
    <MiniAppProviderContext.Provider value={miniAppContext}>
      {children}
    </MiniAppProviderContext.Provider>
  );
}
