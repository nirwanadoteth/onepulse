"use client";

import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useRef } from "react";
import type { MiniAppUser } from "@/components/providers/miniapp-provider";

import { useMiniAppContext } from "@/components/providers/miniapp-provider";
import { gmStatsByAddressStore } from "@/stores/gm-store";

type SuccessReporterProps = {
  status: string;
  onReported?: () => void;
  address?: string;
  refetchLastGmDay?: () => Promise<unknown>;
  chainId: number;
  txHash?: string;
};

async function reportToApi({
  address,
  chainId,
  txHash,
  fid,
  displayName,
  username,
}: {
  address: string;
  chainId: number;
  txHash?: string;
  fid?: number;
  displayName?: string;
  username?: string;
}) {
  try {
    await fetch("/api/gm/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        address,
        chainId,
        txHash,
        fid,
        displayName,
        username,
      }),
    });
  } catch (error) {
    console.error("[SuccessReporter] Report POST failed:", error);
  }
}

async function refreshStats(
  address: string,
  queryClient: ReturnType<typeof useQueryClient>
) {
  try {
    await gmStatsByAddressStore.refreshForAddress(address);
  } catch (error) {
    console.error("[SuccessReporter] refreshForAddress() failed:", error);
  }

  try {
    await queryClient.invalidateQueries({
      queryKey: ["gm-stats", address],
    });
  } catch (error) {
    console.error("[SuccessReporter] Query cache invalidation failed:", error);
  }
}

async function refetchOnChainState(refetchLastGmDay?: () => Promise<unknown>) {
  try {
    await refetchLastGmDay?.();
  } catch (error) {
    console.error("[SuccessReporter] refetchLastGmDay() failed:", error);
  }
}

async function performGmReporting({
  address,
  chainId,
  txHash,
  user,
  queryClient,
  refetchLastGmDay,
  onReported,
}: {
  address: string;
  chainId: number;
  txHash?: string;
  user: MiniAppUser | undefined;
  queryClient: ReturnType<typeof useQueryClient>;
  refetchLastGmDay?: () => Promise<unknown>;
  onReported?: () => void;
}) {
  await reportToApi({
    address,
    chainId,
    txHash,
    fid: user?.fid,
    displayName: user?.displayName,
    username: user?.username,
  });

  await new Promise((resolve) => setTimeout(resolve, 1000));
  await refreshStats(address, queryClient);
  await refetchOnChainState(refetchLastGmDay);

  onReported?.();
}

export const SuccessReporter = React.memo(
  ({
    status,
    onReported,
    address,
    refetchLastGmDay,
    chainId,
    txHash,
  }: SuccessReporterProps) => {
    const didReport = useRef(false);
    const queryClient = useQueryClient();
    const miniAppContextData = useMiniAppContext();
    const user = miniAppContextData?.context?.user;

    useEffect(() => {
      if (status !== "success" || !address || didReport.current) {
        return;
      }

      didReport.current = true;

      performGmReporting({
        address,
        chainId,
        txHash,
        user,
        queryClient,
        refetchLastGmDay,
        onReported,
      });
    }, [
      status,
      address,
      onReported,
      queryClient,
      refetchLastGmDay,
      chainId,
      txHash,
      user,
    ]);

    return null;
  }
);
