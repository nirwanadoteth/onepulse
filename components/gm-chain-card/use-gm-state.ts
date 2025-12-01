import { useMemo } from "react";
import type { Address } from "viem";
import { useReadContract } from "wagmi";
import type { base, celo, optimism } from "wagmi/chains";
import { dailyGMAbi } from "@/lib/abi/daily-gm";
import { SECONDS_PER_DAY } from "@/lib/constants";
import { getCurrentTimestampSeconds, timestampToDayNumber } from "@/lib/utils";

type ComputeGMStateParams = {
  address: string | undefined;
  contractAddress: `0x${string}`;
  isConnected: boolean;
  lastGmDayData: unknown;
  isPendingLastGm: boolean;
};

type GMState = {
  hasGmToday: boolean;
  gmDisabled: boolean;
  targetSec: number;
};

const computeGMState = (params: ComputeGMStateParams): GMState => {
  const {
    address,
    contractAddress,
    isConnected,
    lastGmDayData,
    isPendingLastGm,
  } = params;

  if (!(address && contractAddress)) {
    return { hasGmToday: false, gmDisabled: !isConnected, targetSec: 0 };
  }

  if (lastGmDayData === undefined) {
    return { hasGmToday: false, gmDisabled: true, targetSec: 0 };
  }

  const lastDay = typeof lastGmDayData === "bigint" ? Number(lastGmDayData) : 0;
  const nowSec = getCurrentTimestampSeconds();
  const currentDay = timestampToDayNumber(nowSec);
  const alreadyGmToday = lastDay >= currentDay;
  const nextDayStartSec = (currentDay + 1) * SECONDS_PER_DAY;

  return {
    hasGmToday: alreadyGmToday,
    gmDisabled: alreadyGmToday || isPendingLastGm,
    targetSec: nextDayStartSec,
  };
};

export const useGMState = (
  chainId: number,
  contractAddress: `0x${string}`,
  address: string | undefined,
  isConnected: boolean
) => {
  const {
    data: lastGmDayData,
    isPending: isPendingLastGm,
    refetch: refetchLastGmDay,
  } = useReadContract({
    chainId: chainId as typeof base.id | typeof celo.id | typeof optimism.id,
    abi: dailyGMAbi,
    address: contractAddress,
    functionName: "lastGMDay",
    args: address ? [address as Address] : undefined,
    query: { enabled: Boolean(address && contractAddress) },
  });

  const { hasGmToday, gmDisabled, targetSec } = useMemo(
    () =>
      computeGMState({
        address,
        contractAddress,
        isConnected,
        lastGmDayData,
        isPendingLastGm,
      }),
    [address, contractAddress, isConnected, lastGmDayData, isPendingLastGm]
  );

  return {
    hasGmToday,
    gmDisabled,
    targetSec,
    refetchLastGmDay,
  };
};
