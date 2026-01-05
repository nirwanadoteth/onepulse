import { useReadDailyGmLastGmDay } from "@/helpers/contracts";
import type { ChainId } from "@/lib/constants";
import { getCurrentTimestampSeconds, timestampToDayNumber } from "@/lib/utils";

type ComputeGMStateParams = {
  address?: `0x${string}`;
  contractAddress: `0x${string}`;
  isConnected: boolean;
  lastGmDayData: unknown;
  isPendingLastGm: boolean;
};

type GMState = {
  hasGmToday: boolean;
  gmDisabled: boolean;
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
    return { hasGmToday: false, gmDisabled: !isConnected };
  }

  if (lastGmDayData === undefined) {
    return { hasGmToday: false, gmDisabled: true };
  }

  if (typeof lastGmDayData !== "bigint") {
    return { hasGmToday: false, gmDisabled: true };
  }

  const lastDay = Number(lastGmDayData);
  const nowSec = getCurrentTimestampSeconds();
  const currentDay = timestampToDayNumber(nowSec);
  const alreadyGmToday = lastDay >= currentDay;

  return {
    hasGmToday: alreadyGmToday,
    gmDisabled: alreadyGmToday || isPendingLastGm,
  };
};

export const useGMState = (
  chainId: ChainId,
  contractAddress: `0x${string}`,
  isConnected: boolean,
  address?: `0x${string}`
) => {
  const { data: lastGmDayData, isPending: isPendingLastGm } =
    useReadDailyGmLastGmDay({
      chainId,
      args: address ? [address] : undefined,
      query: { enabled: Boolean(address) },
    });

  const { hasGmToday, gmDisabled } = computeGMState({
    address,
    contractAddress,
    isConnected,
    lastGmDayData,
    isPendingLastGm,
  });

  return {
    hasGmToday,
    gmDisabled,
  };
};
