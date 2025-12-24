import { useCallback } from "react";
import type { Address, ContractFunctionParameters } from "viem";

import { dailyRewardsV2Abi } from "@/lib/abi/daily-rewards-v2";
import { signIn } from "@/lib/client-auth";
import { handleError } from "@/lib/error-handling";

type UseClaimContractsProps = {
  address?: string;
  fid?: bigint;
  contractAddress?: string;
  cachedFid?: number;
  chainId?: number;
};

async function resolveFidToUse(params: {
  fid: bigint;
  cachedFid?: number;
}): Promise<bigint> {
  if (typeof params.cachedFid === "number") {
    return BigInt(params.cachedFid);
  }

  try {
    const verifiedFid = await signIn();
    if (verifiedFid?.fid) {
      return BigInt(verifiedFid.fid);
    }
  } catch (error) {
    handleError(
      error,
      "Failed to sign in",
      { operation: "claims/sign-in" },
      { silent: true }
    );
  }

  return params.fid;
}

async function readClaimAuthorizationErrorMessage(
  response: Response
): Promise<string> {
  const fallback = "Failed to get claim authorization";
  const text = await response.text();
  if (!text) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(text) as { message?: unknown };
    if (typeof parsed.message === "string" && parsed.message) {
      return parsed.message;
    }
  } catch {
    // Not JSON
  }

  return text;
}

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
  chainId,
}: UseClaimContractsProps) {
  return useCallback(async (): Promise<ContractFunctionParameters[]> => {
    if (!address || fid === undefined || !contractAddress || !chainId) {
      throw new Error("Missing required parameters");
    }

    const fidToUse = await resolveFidToUse({ fid, cachedFid });

    const deadline = BigInt(Math.floor(Date.now() / 1000) + 300);

    const response = await fetch("/api/claims/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        claimer: address,
        fid: Number(fidToUse),
        deadline: Number(deadline),
        chainId,
      }),
    });

    if (!response.ok) {
      const errorMessage = await readClaimAuthorizationErrorMessage(response);
      throw new Error(errorMessage || "Failed to get claim authorization");
    }

    const { signature, nonce: backendNonce } = await response.json();

    return [
      {
        address: contractAddress as Address,
        abi: dailyRewardsV2Abi,
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
  }, [address, fid, contractAddress, cachedFid, chainId]);
}
