import { useCallback, useEffect, useState } from "react";
import { useReadContract } from "wagmi";
import { dailyRewardsV2Abi } from "@/lib/abi/daily-rewards-v2";

type DailyRewardsV2Status = {
  backendSigner: string | undefined;
  rewardToken: string | undefined;
  claimRewardAmount: bigint | undefined;
  minVaultBalance: bigint | undefined;
  dailyClaimLimit: bigint | undefined;
  dailyGMContract: string | undefined;
  vaultStatus:
    | {
        currentBalance: bigint;
        minReserve: bigint;
        availableForClaims: bigint;
      }
    | undefined;
  owner: string | undefined;
  pendingOwner: string | undefined;
  isLoading: boolean;
  refetch: () => void;
};

export function useDailyRewardsV2Read(contractAddress: `0x${string}` | "") {
  const [status, setStatus] = useState<DailyRewardsV2Status>({
    backendSigner: undefined,
    rewardToken: undefined,
    claimRewardAmount: undefined,
    minVaultBalance: undefined,
    dailyClaimLimit: undefined,
    dailyGMContract: undefined,
    vaultStatus: undefined,
    owner: undefined,
    pendingOwner: undefined,
    isLoading: true,
    refetch: () => {
      // No-op initial refetch function
    },
  });

  const enabled = !!contractAddress;
  const validAddress = (enabled ? contractAddress : undefined) as
    | `0x${string}`
    | undefined;

  const {
    data: backendSignerData,
    isLoading: loadingBackendSigner,
    refetch: refetchBackendSigner,
  } = useReadContract({
    address: validAddress,
    abi: dailyRewardsV2Abi,
    functionName: "backendSigner",
    query: { enabled },
  });

  const {
    data: rewardTokenData,
    isLoading: loadingRewardToken,
    refetch: refetchRewardToken,
  } = useReadContract({
    address: validAddress,
    abi: dailyRewardsV2Abi,
    functionName: "rewardToken",
    query: { enabled },
  });

  const {
    data: claimRewardAmountData,
    isLoading: loadingClaimRewardAmount,
    refetch: refetchClaimRewardAmount,
  } = useReadContract({
    address: validAddress,
    abi: dailyRewardsV2Abi,
    functionName: "claimRewardAmount",
    query: { enabled },
  });

  const {
    data: minVaultBalanceData,
    isLoading: loadingMinVaultBalance,
    refetch: refetchMinVaultBalance,
  } = useReadContract({
    address: validAddress,
    abi: dailyRewardsV2Abi,
    functionName: "minVaultBalance",
    query: { enabled },
  });

  const {
    data: dailyClaimLimitData,
    isLoading: loadingDailyClaimLimit,
    refetch: refetchDailyClaimLimit,
  } = useReadContract({
    address: validAddress,
    abi: dailyRewardsV2Abi,
    functionName: "dailyClaimLimit",
    query: { enabled },
  });

  const {
    data: dailyGMContractData,
    isLoading: loadingDailyGMContract,
    refetch: refetchDailyGMContract,
  } = useReadContract({
    address: validAddress,
    abi: dailyRewardsV2Abi,
    functionName: "dailyGMContract",
    query: { enabled },
  });

  const {
    data: vaultStatusData,
    isLoading: loadingVaultStatus,
    refetch: refetchVaultStatus,
  } = useReadContract({
    address: validAddress,
    abi: dailyRewardsV2Abi,
    functionName: "getVaultStatus",
    query: { enabled },
  });

  const {
    data: ownerData,
    isLoading: loadingOwner,
    refetch: refetchOwner,
  } = useReadContract({
    address: validAddress,
    abi: dailyRewardsV2Abi,
    functionName: "owner",
    query: { enabled },
  });

  const {
    data: pendingOwnerData,
    isLoading: loadingPendingOwner,
    refetch: refetchPendingOwner,
  } = useReadContract({
    address: validAddress,
    abi: dailyRewardsV2Abi,
    functionName: "pendingOwner",
    query: { enabled },
  });

  const handleRefetch = useCallback(() => {
    refetchBackendSigner?.();
    refetchRewardToken?.();
    refetchClaimRewardAmount?.();
    refetchMinVaultBalance?.();
    refetchDailyClaimLimit?.();
    refetchDailyGMContract?.();
    refetchVaultStatus?.();
    refetchOwner?.();
    refetchPendingOwner?.();
  }, [
    refetchBackendSigner,
    refetchRewardToken,
    refetchClaimRewardAmount,
    refetchMinVaultBalance,
    refetchDailyClaimLimit,
    refetchDailyGMContract,
    refetchVaultStatus,
    refetchOwner,
    refetchPendingOwner,
  ]);

  useEffect(() => {
    setStatus({
      backendSigner: backendSignerData as string | undefined,
      rewardToken: rewardTokenData as string | undefined,
      claimRewardAmount: claimRewardAmountData as bigint | undefined,
      minVaultBalance: minVaultBalanceData as bigint | undefined,
      dailyClaimLimit: dailyClaimLimitData as bigint | undefined,
      dailyGMContract: dailyGMContractData as string | undefined,
      vaultStatus: vaultStatusData
        ? {
            currentBalance: vaultStatusData[0],
            minReserve: vaultStatusData[1],
            availableForClaims: vaultStatusData[2],
          }
        : undefined,
      owner: ownerData as string | undefined,
      pendingOwner: pendingOwnerData as string | undefined,
      isLoading:
        loadingBackendSigner ||
        loadingRewardToken ||
        loadingClaimRewardAmount ||
        loadingMinVaultBalance ||
        loadingDailyClaimLimit ||
        loadingDailyGMContract ||
        loadingVaultStatus ||
        loadingOwner ||
        loadingPendingOwner,
      refetch: handleRefetch,
    });
  }, [
    backendSignerData,
    rewardTokenData,
    claimRewardAmountData,
    minVaultBalanceData,
    dailyClaimLimitData,
    dailyGMContractData,
    vaultStatusData,
    ownerData,
    pendingOwnerData,
    loadingBackendSigner,
    loadingRewardToken,
    loadingClaimRewardAmount,
    loadingMinVaultBalance,
    loadingDailyClaimLimit,
    loadingDailyGMContract,
    loadingVaultStatus,
    loadingOwner,
    loadingPendingOwner,
    handleRefetch,
  ]);

  return status;
}
