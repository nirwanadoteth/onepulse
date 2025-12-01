import type { Address } from "viem";
import { useReadContract } from "wagmi";
import { dailyGMAbi } from "@/lib/abi/daily-gm";
import { SECONDS_PER_DAY } from "@/lib/constants";
import { getCurrentTimestampSeconds, timestampToDayNumber } from "@/lib/utils";
import type { Chain } from "../home/chain-config";

type ComputeGMStateParams = {
  address: Address | undefined;
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

  if (typeof lastGmDayData !== "bigint") {
    return { hasGmToday: false, gmDisabled: true, targetSec: 0 };
  }

  const lastDay = Number(lastGmDayData);
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
  chainId: Chain["id"],
  contractAddress: `0x${string}`,
  address: Address | undefined,
  isConnected: boolean
) => {
  const {
    data: lastGmDayData,
    isPending: isPendingLastGm,
    refetch: refetchLastGmDay,
  } = useReadContract({
    chainId,
    abi: dailyGMAbi,
    address: contractAddress,
    functionName: "lastGMDay",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && contractAddress) },
  });

  const { hasGmToday, gmDisabled, targetSec } = computeGMState({
    address,
    contractAddress,
    isConnected,
    lastGmDayData,
    isPendingLastGm,
  });

  return {
    hasGmToday,
    gmDisabled,
    targetSec,
    refetchLastGmDay,
  };
};
