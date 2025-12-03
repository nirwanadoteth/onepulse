import { sdk } from "@farcaster/miniapp-sdk";
import type { QueryClient } from "@tanstack/react-query";
import type { MiniAppUser } from "@/components/providers/miniapp-provider";
import { gmStatsByAddressStore } from "@/stores/gm-store";

export async function reportToApi({
  address,
  chainId,
  txHash,
  displayName,
  username,
  inMiniApp = false,
}: {
  address: string;
  chainId: number;
  txHash?: string;
  displayName?: string;
  username?: string;
  inMiniApp?: boolean;
}) {
  try {
    const body = JSON.stringify({
      address,
      chainId,
      txHash,
      displayName,
      username,
    });

    const fetchOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    };

    // Use Quick Auth fetch when in mini app to securely pass verified FID
    if (inMiniApp) {
      await sdk.quickAuth.fetch("/api/gm/report", fetchOptions);
    } else {
      await fetch("/api/gm/report", fetchOptions);
    }
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
  queryClient,
  refetchLastGmDay,
  onReported,
  inMiniApp = false,
}: {
  address: string;
  chainId: number;
  txHash?: string;
  user: MiniAppUser | undefined;
  queryClient: QueryClient;
  refetchLastGmDay?: () => Promise<unknown>;
  onReported?: () => void;
  inMiniApp?: boolean;
}) {
  await reportToApi({
    address,
    chainId,
    txHash,
    displayName: user?.displayName,
    username: user?.username,
    inMiniApp,
  });

  await new Promise((resolve) => setTimeout(resolve, 1000));
  await refreshStats(address, queryClient);
  await refetchOnChainState(refetchLastGmDay);

  onReported?.();
}
