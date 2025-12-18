import { erc20Abi } from "viem";
import { useReadContract } from "wagmi";

type Erc20MetadataResult = {
  decimals: number | undefined;
  symbol: string | undefined;
  isLoading: boolean;
};

export function useErc20Metadata(
  tokenAddress: `0x${string}` | "" | undefined,
  chainId?: number
): Erc20MetadataResult {
  const enabled =
    typeof tokenAddress === "string" && tokenAddress.startsWith("0x");
  const validAddress = enabled ? (tokenAddress as `0x${string}`) : undefined;

  const { data: decimalsData, isLoading: loadingDecimals } = useReadContract({
    address: validAddress,
    abi: erc20Abi,
    functionName: "decimals",
    chainId,
    query: { enabled },
  });

  const { data: symbolData, isLoading: loadingSymbol } = useReadContract({
    address: validAddress,
    abi: erc20Abi,
    functionName: "symbol",
    chainId,
    query: { enabled },
  });

  return {
    decimals: decimalsData,
    symbol: symbolData,
    isLoading: loadingDecimals || loadingSymbol,
  };
}
