"use client";

import { useAddress } from "@coinbase/onchainkit/identity";
import { isAddress } from "viem";

type ResolverResult = {
  address: string | null;
  isLoading: boolean;
  isError: boolean;
};

export function useEnsBasenameResolver(input: string): ResolverResult {
  const trimmed = input.trim();

  const isValidAddress = isAddress(trimmed);

  const isDomain =
    !isValidAddress &&
    trimmed.includes(".") &&
    (trimmed.endsWith(".eth") || trimmed.endsWith(".base.eth"));

  const {
    data: resolvedAddress,
    isLoading,
    isError,
  } = useAddress({
    name: isDomain ? trimmed : "",
  });

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
