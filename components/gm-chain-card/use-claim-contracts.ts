import { sdk } from "@farcaster/miniapp-sdk";
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
 * Uses Quick Auth to securely authenticate the user's FID with the backend.
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

    const deadline = BigInt(Math.floor(Date.now() / 1000) + 300);

    // Use Quick Auth fetch to securely pass the user's verified FID to the backend
    // The backend will extract the FID from the JWT token, not from the request body
    const response = await sdk.quickAuth.fetch("/api/claims/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        claimer: address,
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
