"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { SpacetimeDBProvider as Provider } from "spacetimedb/react";
import { getConnectionBuilder } from "@/lib/spacetimedb/connection-factory";

export const SpacetimeDBProvider = ({ children }: { children: ReactNode }) => {
  const [connectionBuilder, setConnectionBuilder] = useState<ReturnType<
    typeof getConnectionBuilder
  > | null>(null);

  useEffect(() => {
    // Only create connection builder on client side
    if (typeof window !== "undefined") {
      const builder = getConnectionBuilder();
      setConnectionBuilder(builder);
    }
  }, []);

  // Render children without provider until connection builder is ready
  if (!connectionBuilder) {
    return <>{children}</>;
  }

  return <Provider connectionBuilder={connectionBuilder}>{children}</Provider>;
};
