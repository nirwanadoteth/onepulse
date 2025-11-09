import { useCallback } from "react";
import type { ContractFunctionParameters } from "viem";

import { dailyRewardsAbi } from "@/lib/abi/daily-rewards";

type UseClaimContractsProps = {
  address?: string;
  fid?: bigint;
  contractAddress?: string;
};

/**
 * Hook to generate backend-signed claim contract calls.
 * Fetches signature from /api/claims/execute before contract execution.
 */
export function useClaimContracts({
  address,
  fid,
  contractAddress,
}: UseClaimContractsProps) {
  return useCallback(async (): Promise<ContractFunctionParameters[]> => {
    const hasValidParams = address && fid && contractAddress;
    if (!hasValidParams) {
      throw new Error("Missing required parameters");
    }

    // Calculate fresh deadline (5 minutes from now)
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 300);

    // Request backend signature (backend reads current nonce from contract)
    const response = await fetch("/api/claims/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        claimer: address,
        fid: fid.toString(),
        deadline: deadline.toString(),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to get claim authorization");
    }

    const { signature, nonce: backendNonce } = await response.json();

    return [
      {
        address: contractAddress as `0x${string}`,
        abi: dailyRewardsAbi,
        functionName: "claim",
        args: [
          address,
          fid,
          BigInt(backendNonce),
          deadline,
          signature as `0x${string}`,
        ],
      },
    ];
  }, [address, fid, contractAddress]);
}
