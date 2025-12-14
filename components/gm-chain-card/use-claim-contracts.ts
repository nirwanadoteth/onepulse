import { useCallback } from "react";
import type { ContractFunctionParameters } from "viem";

import { dailyRewardsAbi } from "@/lib/abi/daily-rewards";
import { signIn } from "@/lib/client-auth";

type UseClaimContractsProps = {
  address?: string;
  fid?: bigint;
  contractAddress?: string;
  cachedFid?: number;
};

/**
 * Hook to generate backend-signed claim contract calls.
 * Uses verified FID from Quick Auth (verified once at mini app load).
 * Fetches signature from /api/claims/execute before contract execution.
 */
export function useClaimContracts({
  address,
  fid,
  contractAddress,
  cachedFid,
}: UseClaimContractsProps) {
  return useCallback(async (): Promise<ContractFunctionParameters[]> => {
    const hasValidParams = address && fid && contractAddress;
    if (!hasValidParams) {
      throw new Error("Missing required parameters");
    }

    // Use verified FID if available, otherwise fall back to context FID
    let fidToUse = fid; // bigint

    if (typeof cachedFid === "number") {
      fidToUse = BigInt(cachedFid);
    } else {
      try {
        const verifiedFid = await signIn();
        if (verifiedFid) {
          fidToUse = BigInt(verifiedFid);
        }
      } catch (error) {
        console.error(
          "Failed to sign in during claim contract generation:",
          error
        );
      }
    }

    const deadline = BigInt(Math.floor(Date.now() / 1000) + 300);

    const response = await fetch("/api/claims/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        claimer: address,
        fid: fidToUse.toString(),
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
          fidToUse,
          BigInt(backendNonce),
          deadline,
          signature as `0x${string}`,
        ],
      },
    ];
  }, [address, fid, contractAddress, cachedFid]);
}
