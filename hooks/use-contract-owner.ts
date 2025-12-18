import type { Address } from "viem";
import { base } from "viem/chains";
import { useReadContract } from "wagmi";
import { dailyRewardsV2Abi } from "@/lib/abi/daily-rewards-v2";
import { getDailyRewardsV2Address } from "@/lib/utils";

export function useContractOwner() {
  const contractAddress = getDailyRewardsV2Address(base.id);

  const { data: owner, isLoading } = useReadContract({
    address: contractAddress as Address,
    abi: dailyRewardsV2Abi,
    functionName: "owner",
    chainId: base.id,
    query: {
      enabled: Boolean(contractAddress),
    },
  });

  return {
    owner: owner as Address | undefined,
    isLoading,
  };
}
