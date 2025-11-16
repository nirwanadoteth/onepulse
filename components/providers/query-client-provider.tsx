"use client";

import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { deserialize, serialize } from "wagmi";
import { getQueryClient } from "@/lib/client";

const persister = createAsyncStoragePersister({
  storage: typeof window !== "undefined" ? window.localStorage : null,
  serialize,
  deserialize,
});

export default function QueryClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
