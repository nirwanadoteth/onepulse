import { base } from "viem/chains";
import { useReadContract } from "wagmi";
import { dailyRewardsAbi } from "@/lib/abi/daily-rewards";
import { getDailyRewardsV2Address } from "@/lib/utils";

export function useContractOwner() {
  const contractAddress = getDailyRewardsV2Address(base.id);

  const { data: owner, isLoading } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: dailyRewardsAbi,
    functionName: "owner",
    chainId: base.id,
    query: {
      enabled: Boolean(contractAddress),
    },
  });

  return {
    owner: owner as `0x${string}` | undefined,
    isLoading,
  };
}
