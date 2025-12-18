import type { Address } from "viem";
import { base } from "viem/chains";
import { useReadContracts } from "wagmi";
import { dailyRewardsV2Abi } from "@/lib/abi/daily-rewards-v2";
import { getDailyRewardsV2Address } from "@/lib/utils";

export function useDailyRewardsRead() {
  const contractAddress = getDailyRewardsV2Address(base.id) as Address;

  const { data, isLoading, refetch } = useReadContracts({
    contracts: [
      {
        address: contractAddress,
        abi: dailyRewardsV2Abi,
        functionName: "getVaultStatus",
        chainId: base.id,
      },
      {
        address: contractAddress,
        abi: dailyRewardsV2Abi,
        functionName: "claimRewardAmount",
        chainId: base.id,
      },
      {
        address: contractAddress,
        abi: dailyRewardsV2Abi,
        functionName: "minVaultBalance",
        chainId: base.id,
      },
      {
        address: contractAddress,
        abi: dailyRewardsV2Abi,
        functionName: "dailyGMContract",
        chainId: base.id,
      },
      {
        address: contractAddress,
        abi: dailyRewardsV2Abi,
        functionName: "backendSigner",
        chainId: base.id,
      },
      {
        address: contractAddress,
        abi: dailyRewardsV2Abi,
        functionName: "owner",
        chainId: base.id,
      },
      {
        address: contractAddress,
        abi: dailyRewardsV2Abi,
        functionName: "pendingOwner",
        chainId: base.id,
      },
    ],
    query: {
      enabled: Boolean(contractAddress),
    },
  });

  const vaultStatusArray = data?.[0]?.result as
    | [bigint, bigint, bigint]
    | undefined;
  const vaultStatus = vaultStatusArray
    ? {
        currentBalance: vaultStatusArray[0],
        minReserve: vaultStatusArray[1],
        availableForClaims: vaultStatusArray[2],
      }
    : undefined;
  const claimRewardAmount = data?.[1]?.result as bigint | undefined;
  const minVaultBalance = data?.[2]?.result as bigint | undefined;
  const dailyGMContract = data?.[3]?.result as Address | undefined;
  const backendSigner = data?.[4]?.result as Address | undefined;
  const owner = data?.[5]?.result as Address | undefined;
  const pendingOwner = data?.[6]?.result as Address | undefined;

  return {
    vaultStatus,
    claimRewardAmount,
    minVaultBalance,
    dailyGMContract,
    backendSigner,
    owner,
    pendingOwner,
    isLoading,
    refetch,
    contractAddress,
  };
}
