import {
  waitForTransactionReceipt,
  writeContract,
} from "wagmi/actions"

import { dailyRewardsAbi } from "@/lib/abi/daily-rewards"
import { config as wagmiConfig } from "@/components/providers/wagmi-provider"

/**
 * Gets a backend-signed authorization for claiming rewards.
 * The backend validates eligibility and signs the authorization.
 * The user then submits this signature with their own transaction.
 */
async function getClaimAuthorization(
  claimer: `0x${string}`,
  fid: bigint,
  deadline: bigint
): Promise<`0x${string}`> {
  const response = await fetch("/api/claims/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      claimer,
      fid: Number(fid),
      deadline: Number(deadline),
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to get claim authorization")
  }

  const result = await response.json()
  return result.signature as `0x${string}`
}

/**
 * Executes the claim transaction on-chain.
 * This function works with all wallet types (EOA, smart wallet, passkey, etc.)
 * User pays gas for their own transaction.
 */
export async function executeClaimTransaction(
  address: `0x${string}`,
  contractAddress: `0x${string}`,
  fid: bigint,
  deadline: bigint
) {
  // Get backend-signed authorization
  const signature = await getClaimAuthorization(address, fid, deadline)

  // User submits the transaction with the backend signature
  return writeContract(wagmiConfig, {
    address: contractAddress,
    abi: dailyRewardsAbi,
    functionName: "claim",
    args: [address, fid, deadline, signature],
    account: address,
    chain: undefined,
  })
}

export async function reportClaimToBackend(
  address: `0x${string}`,
  fid: bigint,
  txHash: `0x${string}`
) {
  try {
    await fetch("/api/claims/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        address,
        fid: Number(fid),
        txHash,
      }),
    })
  } catch (err) {
    console.error("Failed to report claim:", err)
  }
}

export async function performClaimFlow(
  address: `0x${string}`,
  fid: bigint,
  contractAddress: `0x${string}`,
  deadline: bigint,
  refetchEligibility: () => void,
  queryClient: ReturnType<typeof import("@tanstack/react-query").useQueryClient>
) {
  // Execute claim transaction (backend signs, user submits)
  const hash = await executeClaimTransaction(
    address,
    contractAddress,
    fid,
    deadline
  )

  await waitForTransactionReceipt(wagmiConfig, { hash, confirmations: 1 })

  // Report claim to backend; don't block on it for failure — log errors inside
  await reportClaimToBackend(address, fid, hash as `0x${string}`)

  // Refresh on-chain eligibility and invalidate readContract caches
  refetchEligibility()
  queryClient.invalidateQueries({ queryKey: ["useReadContract"] })

  return hash
}
