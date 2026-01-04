import type { QueryClient } from "@tanstack/react-query";
import { gmStatsByAddressStore } from "@/stores/gm-store";
import type { MiniAppUser } from "@/types/miniapp";

export async function reportToApi({
  address,
  chainId,
  txHash,
  fid,
  lastGmDay,
  displayName,
  username,
}: {
  address: string;
  chainId: number;
  txHash?: string;
  fid?: number;
  lastGmDay: bigint;
  displayName?: string;
  username?: string;
}) {
  try {
    const lastGmDayNumber = Number(lastGmDay);
    await fetch("/api/gm/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        address,
        chainId,
        txHash,
        fid,
        displayName,
        lastGmDay: lastGmDayNumber,
        username,
      }),
    });
  } catch {
    // Report failure handled silently
  }
}

export async function refreshStats(address: string, queryClient: QueryClient) {
  try {
    await gmStatsByAddressStore.refreshForAddress(address);
  } catch {
    // Store refresh failure handled silently
  }

  try {
    await queryClient.invalidateQueries({
      queryKey: ["gm-stats", address],
    });
  } catch {
    // Query cache invalidation failure handled silently
  }
}

export async function refetchOnChainState(
  refetchLastGmDay?: () => Promise<unknown>
) {
  try {
    await refetchLastGmDay?.();
  } catch {
    // On-chain state refetch failure handled silently
  }
}

export async function performGmReporting({
  address,
  chainId,
  txHash,
  user,
  lastGmDay,
  queryClient,
  refetchLastGmDay,
  onReported,
}: {
  address: string;
  chainId: number;
  lastGmDay: bigint;
  txHash?: string;
  user: MiniAppUser | undefined;
  queryClient: QueryClient;
  refetchLastGmDay?: () => Promise<unknown>;
  onReported?: () => void;
}) {
  // Use context user FID
  const fid = user?.fid;

  await reportToApi({
    address,
    chainId,
    txHash,
    fid,
    lastGmDay,
    displayName: user?.displayName,
    username: user?.username,
  });

  await new Promise((resolve) => setTimeout(resolve, 1000));
  await refreshStats(address, queryClient);
  await refetchOnChainState(refetchLastGmDay);

  onReported?.();
}
