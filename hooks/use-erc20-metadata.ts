import { isAddress } from "viem/utils";
import { useReadErc20Decimals, useReadErc20Symbol } from "@/helpers/contracts";
import type { ChainId } from "@/lib/constants";

type Erc20MetadataResult = {
  decimals: number | undefined;
  symbol: string | undefined;
  isLoading: boolean;
};

export function useErc20Metadata(
  tokenAddress: `0x${string}` | undefined,
  chainId: ChainId
): Erc20MetadataResult {
  const enabled = isAddress(tokenAddress || "");
  const validAddress = enabled ? (tokenAddress as `0x${string}`) : undefined;

  const { data: decimalsData, isLoading: loadingDecimals } =
    useReadErc20Decimals({
      address: validAddress,
      chainId,
      query: { enabled },
    });

  const { data: symbolData, isLoading: loadingSymbol } = useReadErc20Symbol({
    address: validAddress,
    chainId,
    query: { enabled },
  });

  return {
    decimals: decimalsData,
    symbol: symbolData,
    isLoading: loadingDecimals || loadingSymbol,
  };
}
