import {
  getAccount,
  waitForTransactionReceipt,
  writeContract,
  getPublicClient,
} from "wagmi/actions"

import { dailyRewardsAbi } from "@/lib/abi/daily-rewards"
import { config as wagmiConfig } from "@/components/providers/wagmi-provider"

async function isSmartWallet(): Promise<boolean> {
  try {
    const account = getAccount(wagmiConfig)
    if (!account.address) {
      return false
    }

    // Get public client for on-chain verification
    const publicClient = getPublicClient(wagmiConfig)
    if (!publicClient) {
      return false
    }

    // Check if the address has bytecode (smart contract wallet)
    const bytecode = await publicClient.getCode({
      address: account.address,
    })

    // If bytecode exists, it's a smart contract wallet
    return bytecode !== undefined && bytecode !== "0x"
  } catch {
    return false
  }
}

async function executeGaslessClaim(
  claimer: `0x${string}`,
  fid: bigint,
  deadline: bigint,
  signature: `0x${string}`
): Promise<`0x${string}`> {
  const response = await fetch("/api/claims/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      claimer,
      fid: Number(fid),
      deadline: Number(deadline),
      signature,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to execute gasless claim")
  }

  const result = await response.json()
  return result.txHash as `0x${string}`
}

export async function executeClaimTransaction(
  address: `0x${string}`,
  contractAddress: `0x${string}`,
  fid: bigint,
  signature: `0x${string}`,
  deadline: bigint
) {
  // Check if user has a smart wallet
  const useGasless = await isSmartWallet()

  if (useGasless) {
    // Use backend gasless operator for smart wallets
    return executeGaslessClaim(address, fid, deadline, signature)
  }

  // Direct on-chain claim for EOAs
  return writeContract(wagmiConfig, {
    address: contractAddress,
    abi: dailyRewardsAbi,
    functionName: "claim",
    args: [fid, deadline, signature],
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
  generateSignature: (
    fid: bigint
  ) => Promise<{ signature: `0x${string}`; deadline: bigint }>,
  refetchEligibility: () => void,
  queryClient: ReturnType<typeof import("@tanstack/react-query").useQueryClient>
) {
  const { signature, deadline } = await generateSignature(fid)

  const hash = await executeClaimTransaction(
    address,
    contractAddress,
    fid,
    signature,
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
