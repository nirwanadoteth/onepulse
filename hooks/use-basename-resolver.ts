"use client";

import { useAddress } from "@coinbase/onchainkit/identity";
import { base } from "@wagmi/core/chains";
import { normalize } from "viem/ens";
import { isAddress } from "viem/utils";
import { isDomainFormat } from "@/lib/utils";

type ResolverResult = {
  address: string | null;
  isLoading: boolean;
  isError: boolean;
};

export function useBasenameResolver(input: string): ResolverResult {
  const trimmed = input.trim();

  const isValidAddress = isAddress(trimmed);
  const isDomain = !isValidAddress && isDomainFormat(trimmed);

  const {
    data: resolvedAddress,
    isLoading,
    isError,
  } = useAddress(
    {
      name: isDomain ? normalize(trimmed) : "",
      chain: base,
    },
    { enabled: isDomain }
  );

  if (isValidAddress) {
    return {
      address: trimmed,
      isLoading: false,
      isError: false,
    };
  }

  if (!isDomain) {
    return {
      address: null,
      isLoading: false,
      isError: false,
    };
  }

  return {
    address: resolvedAddress ?? null,
    isLoading,
    isError,
  };
}
