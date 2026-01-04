import {
  createUseReadContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
  createUseWriteContract,
} from "wagmi/codegen";

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DailyGm
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x44C252f58a8063cE591BBf7fEe5C7BC1A9CACDA7)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xC9F754F99C069779486Eb9d70b46209c9Ed396CA)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x0e35BA823a96a461c7eD4678A8c3E1ff114946A6)
 */
export const dailyGmAbi = [
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "user", internalType: "address", type: "address", indexed: true },
      {
        name: "recipient",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "GM",
  },
  {
    type: "function",
    inputs: [],
    name: "gm",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "recipient", internalType: "address", type: "address" }],
    name: "gmTo",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "user", internalType: "address", type: "address" }],
    name: "lastGMDay",
    outputs: [{ name: "lastGMDay", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

/**
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x44C252f58a8063cE591BBf7fEe5C7BC1A9CACDA7)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xC9F754F99C069779486Eb9d70b46209c9Ed396CA)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x0e35BA823a96a461c7eD4678A8c3E1ff114946A6)
 */
export const dailyGmAddress = {
  8453: "0xC9F754F99C069779486Eb9d70b46209c9Ed396CA",
} as const;

/**
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x44C252f58a8063cE591BBf7fEe5C7BC1A9CACDA7)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xC9F754F99C069779486Eb9d70b46209c9Ed396CA)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x0e35BA823a96a461c7eD4678A8c3E1ff114946A6)
 */
export const dailyGmConfig = {
  address: dailyGmAddress,
  abi: dailyGmAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DailyRewardsV2
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const dailyRewardsV2Abi = [
  {
    type: "constructor",
    inputs: [
      { name: "_backendSigner", internalType: "address", type: "address" },
      { name: "_rewardToken", internalType: "address", type: "address" },
      { name: "_dailyGMContract", internalType: "address", type: "address" },
    ],
    stateMutability: "payable",
  },
  { type: "error", inputs: [], name: "AlreadyClaimedFIDToday" },
  { type: "error", inputs: [], name: "BatchTooLarge" },
  { type: "error", inputs: [], name: "BelowMinimumReserve" },
  { type: "error", inputs: [], name: "DeadlineTooLong" },
  { type: "error", inputs: [], name: "ECDSAInvalidSignature" },
  {
    type: "error",
    inputs: [{ name: "length", internalType: "uint256", type: "uint256" }],
    name: "ECDSAInvalidSignatureLength",
  },
  {
    type: "error",
    inputs: [{ name: "s", internalType: "bytes32", type: "bytes32" }],
    name: "ECDSAInvalidSignatureS",
  },
  { type: "error", inputs: [], name: "FIDBlacklisted" },
  { type: "error", inputs: [], name: "GlobalDailyClaimLimitExceeded" },
  { type: "error", inputs: [], name: "InsufficientVaultBalance" },
  { type: "error", inputs: [], name: "InvalidFID" },
  { type: "error", inputs: [], name: "InvalidSignature" },
  { type: "error", inputs: [], name: "MustGMToday" },
  {
    type: "error",
    inputs: [{ name: "owner", internalType: "address", type: "address" }],
    name: "OwnableInvalidOwner",
  },
  {
    type: "error",
    inputs: [{ name: "account", internalType: "address", type: "address" }],
    name: "OwnableUnauthorizedAccount",
  },
  { type: "error", inputs: [], name: "ReentrancyGuardReentrantCall" },
  {
    type: "error",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "SafeERC20FailedOperation",
  },
  { type: "error", inputs: [], name: "SameValue" },
  { type: "error", inputs: [], name: "SignatureAlreadyUsed" },
  { type: "error", inputs: [], name: "SignatureExpired" },
  { type: "error", inputs: [], name: "ZeroAddress" },
  { type: "error", inputs: [], name: "ZeroAmount" },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "oldSigner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "newSigner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "BackendSignerUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "fids",
        internalType: "uint256[]",
        type: "uint256[]",
        indexed: false,
      },
      {
        name: "isBlacklisted",
        internalType: "bool",
        type: "bool",
        indexed: true,
      },
    ],
    name: "BlacklistUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "oldValue",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "newValue",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "ClaimRewardAmountUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "recipient",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "fid", internalType: "uint256", type: "uint256", indexed: true },
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Claimed",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "day", internalType: "uint256", type: "uint256", indexed: false },
      {
        name: "claimCount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "DailyClaimLimitReached",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "oldValue",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "newValue",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "DailyClaimLimitUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "oldContract",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "newContract",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "DailyGMContractUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "oldValue",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "newValue",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "MinVaultBalanceUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "previousOwner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "newOwner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "OwnershipTransferStarted",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "previousOwner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "newOwner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "OwnershipTransferred",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "oldToken",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "newToken",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "RewardTokenUpdated",
  },
  {
    type: "function",
    inputs: [],
    name: "acceptOwnership",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "backendSigner",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "claimer", internalType: "address", type: "address" },
      { name: "fid", internalType: "uint256", type: "uint256" },
    ],
    name: "canClaimToday",
    outputs: [
      {
        name: "status",
        internalType: "struct DailyRewardsV2.ClaimStatus",
        type: "tuple",
        components: [
          { name: "ok", internalType: "bool", type: "bool" },
          { name: "fidIsBlacklisted", internalType: "bool", type: "bool" },
          { name: "fidClaimedToday", internalType: "bool", type: "bool" },
          { name: "globalLimitReached", internalType: "bool", type: "bool" },
          { name: "hasSentGMToday", internalType: "bool", type: "bool" },
          { name: "reward", internalType: "uint256", type: "uint256" },
          { name: "vaultBalance", internalType: "uint256", type: "uint256" },
          { name: "minReserve", internalType: "uint256", type: "uint256" },
          {
            name: "globalClaimsToday",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "globalClaimLimit",
            internalType: "uint256",
            type: "uint256",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "claimer", internalType: "address", type: "address" },
      { name: "fid", internalType: "uint256", type: "uint256" },
      { name: "nonce", internalType: "uint256", type: "uint256" },
      { name: "deadline", internalType: "uint256", type: "uint256" },
      { name: "signature", internalType: "bytes", type: "bytes" },
    ],
    name: "claim",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "claimRewardAmount",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    name: "claimedByDay",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "dailyClaimCount",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "dailyClaimLimit",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "dailyGMContract",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "amount", internalType: "uint256", type: "uint256" }],
    name: "deposit",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [{ name: "amount", internalType: "uint256", type: "uint256" }],
    name: "emergencyWithdraw",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "fidInfo",
    outputs: [
      { name: "blacklisted", internalType: "bool", type: "bool" },
      { name: "blacklistedSince", internalType: "uint48", type: "uint48" },
      { name: "reserved1", internalType: "uint48", type: "uint48" },
      { name: "reserved2", internalType: "uint160", type: "uint160" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getVaultStatus",
    outputs: [
      { name: "currentBalance", internalType: "uint256", type: "uint256" },
      { name: "minReserve", internalType: "uint256", type: "uint256" },
      { name: "availableForClaims", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "invalidatePendingSignatures",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "minVaultBalance",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "nonces",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "owner",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "pendingOwner",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "rewardToken",
    outputs: [{ name: "", internalType: "contract IERC20", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_backendSigner", internalType: "address", type: "address" },
    ],
    name: "setBackendSigner",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "_claimRewardAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "setClaimRewardAmount",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "_dailyClaimLimit", internalType: "uint256", type: "uint256" },
    ],
    name: "setDailyClaimLimit",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "_dailyGMContract", internalType: "address", type: "address" },
    ],
    name: "setDailyGMContract",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "_minVaultBalance", internalType: "uint256", type: "uint256" },
    ],
    name: "setMinVaultBalance",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "_rewardToken", internalType: "address", type: "address" },
    ],
    name: "setRewardToken",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [{ name: "newOwner", internalType: "address", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "fids", internalType: "uint256[]", type: "uint256[]" },
      { name: "isBlacklisted", internalType: "bool", type: "bool" },
    ],
    name: "updateBlacklist",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "bytes", type: "bytes" }],
    name: "usedSignatures",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "userInfo",
    outputs: [
      { name: "lastClaimDay", internalType: "uint48", type: "uint48" },
      { name: "reserved1", internalType: "uint48", type: "uint48" },
      { name: "reserved2", internalType: "uint160", type: "uint160" },
    ],
    stateMutability: "view",
  },
] as const;

/**
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const dailyRewardsV2Address = {
  8453: "0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07",
} as const;

/**
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const dailyRewardsV2Config = {
  address: dailyRewardsV2Address,
  abi: dailyRewardsV2Abi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// erc20
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc20Abi = [
  {
    type: "event",
    inputs: [
      { name: "owner", type: "address", indexed: true },
      { name: "spender", type: "address", indexed: true },
      { name: "value", type: "uint256", indexed: false },
    ],
    name: "Approval",
  },
  {
    type: "event",
    inputs: [
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "value", type: "uint256", indexed: false },
    ],
    name: "Transfer",
  },
  {
    type: "function",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "decimals",
    outputs: [{ type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "name",
    outputs: [{ type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "symbol",
    outputs: [{ type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "totalSupply",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "recipient", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "sender", type: "address" },
      { name: "recipient", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ type: "bool" }],
    stateMutability: "nonpayable",
  },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dailyGmAbi}__
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x44C252f58a8063cE591BBf7fEe5C7BC1A9CACDA7)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xC9F754F99C069779486Eb9d70b46209c9Ed396CA)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x0e35BA823a96a461c7eD4678A8c3E1ff114946A6)
 */
export const useReadDailyGm = /*#__PURE__*/ createUseReadContract({
  abi: dailyGmAbi,
  address: dailyGmAddress,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dailyGmAbi}__ and `functionName` set to `"lastGMDay"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x44C252f58a8063cE591BBf7fEe5C7BC1A9CACDA7)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xC9F754F99C069779486Eb9d70b46209c9Ed396CA)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x0e35BA823a96a461c7eD4678A8c3E1ff114946A6)
 */
export const useReadDailyGmLastGmDay = /*#__PURE__*/ createUseReadContract({
  abi: dailyGmAbi,
  address: dailyGmAddress,
  functionName: "lastGMDay",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dailyGmAbi}__
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x44C252f58a8063cE591BBf7fEe5C7BC1A9CACDA7)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xC9F754F99C069779486Eb9d70b46209c9Ed396CA)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x0e35BA823a96a461c7eD4678A8c3E1ff114946A6)
 */
export const useWriteDailyGm = /*#__PURE__*/ createUseWriteContract({
  abi: dailyGmAbi,
  address: dailyGmAddress,
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dailyGmAbi}__ and `functionName` set to `"gm"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x44C252f58a8063cE591BBf7fEe5C7BC1A9CACDA7)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xC9F754F99C069779486Eb9d70b46209c9Ed396CA)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x0e35BA823a96a461c7eD4678A8c3E1ff114946A6)
 */
export const useWriteDailyGmGm = /*#__PURE__*/ createUseWriteContract({
  abi: dailyGmAbi,
  address: dailyGmAddress,
  functionName: "gm",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dailyGmAbi}__ and `functionName` set to `"gmTo"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x44C252f58a8063cE591BBf7fEe5C7BC1A9CACDA7)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xC9F754F99C069779486Eb9d70b46209c9Ed396CA)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x0e35BA823a96a461c7eD4678A8c3E1ff114946A6)
 */
export const useWriteDailyGmGmTo = /*#__PURE__*/ createUseWriteContract({
  abi: dailyGmAbi,
  address: dailyGmAddress,
  functionName: "gmTo",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dailyGmAbi}__
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x44C252f58a8063cE591BBf7fEe5C7BC1A9CACDA7)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xC9F754F99C069779486Eb9d70b46209c9Ed396CA)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x0e35BA823a96a461c7eD4678A8c3E1ff114946A6)
 */
export const useSimulateDailyGm = /*#__PURE__*/ createUseSimulateContract({
  abi: dailyGmAbi,
  address: dailyGmAddress,
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dailyGmAbi}__ and `functionName` set to `"gm"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x44C252f58a8063cE591BBf7fEe5C7BC1A9CACDA7)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xC9F754F99C069779486Eb9d70b46209c9Ed396CA)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x0e35BA823a96a461c7eD4678A8c3E1ff114946A6)
 */
export const useSimulateDailyGmGm = /*#__PURE__*/ createUseSimulateContract({
  abi: dailyGmAbi,
  address: dailyGmAddress,
  functionName: "gm",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dailyGmAbi}__ and `functionName` set to `"gmTo"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x44C252f58a8063cE591BBf7fEe5C7BC1A9CACDA7)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xC9F754F99C069779486Eb9d70b46209c9Ed396CA)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x0e35BA823a96a461c7eD4678A8c3E1ff114946A6)
 */
export const useSimulateDailyGmGmTo = /*#__PURE__*/ createUseSimulateContract({
  abi: dailyGmAbi,
  address: dailyGmAddress,
  functionName: "gmTo",
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link dailyGmAbi}__
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x44C252f58a8063cE591BBf7fEe5C7BC1A9CACDA7)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xC9F754F99C069779486Eb9d70b46209c9Ed396CA)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x0e35BA823a96a461c7eD4678A8c3E1ff114946A6)
 */
export const useWatchDailyGmEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: dailyGmAbi,
  address: dailyGmAddress,
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link dailyGmAbi}__ and `eventName` set to `"GM"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x44C252f58a8063cE591BBf7fEe5C7BC1A9CACDA7)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xC9F754F99C069779486Eb9d70b46209c9Ed396CA)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x0e35BA823a96a461c7eD4678A8c3E1ff114946A6)
 */
export const useWatchDailyGmGmEvent = /*#__PURE__*/ createUseWatchContractEvent(
  { abi: dailyGmAbi, address: dailyGmAddress, eventName: "GM" }
);

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dailyRewardsV2Abi}__
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useReadDailyRewardsV2 = /*#__PURE__*/ createUseReadContract({
  abi: dailyRewardsV2Abi,
  address: dailyRewardsV2Address,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dailyRewardsV2Abi}__ and `functionName` set to `"backendSigner"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useReadDailyRewardsV2BackendSigner =
  /*#__PURE__*/ createUseReadContract({
    abi: dailyRewardsV2Abi,
    address: dailyRewardsV2Address,
    functionName: "backendSigner",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dailyRewardsV2Abi}__ and `functionName` set to `"canClaimToday"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useReadDailyRewardsV2CanClaimToday =
  /*#__PURE__*/ createUseReadContract({
    abi: dailyRewardsV2Abi,
    address: dailyRewardsV2Address,
    functionName: "canClaimToday",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dailyRewardsV2Abi}__ and `functionName` set to `"claimRewardAmount"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useReadDailyRewardsV2ClaimRewardAmount =
  /*#__PURE__*/ createUseReadContract({
    abi: dailyRewardsV2Abi,
    address: dailyRewardsV2Address,
    functionName: "claimRewardAmount",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dailyRewardsV2Abi}__ and `functionName` set to `"claimedByDay"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useReadDailyRewardsV2ClaimedByDay =
  /*#__PURE__*/ createUseReadContract({
    abi: dailyRewardsV2Abi,
    address: dailyRewardsV2Address,
    functionName: "claimedByDay",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dailyRewardsV2Abi}__ and `functionName` set to `"dailyClaimCount"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useReadDailyRewardsV2DailyClaimCount =
  /*#__PURE__*/ createUseReadContract({
    abi: dailyRewardsV2Abi,
    address: dailyRewardsV2Address,
    functionName: "dailyClaimCount",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dailyRewardsV2Abi}__ and `functionName` set to `"dailyClaimLimit"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useReadDailyRewardsV2DailyClaimLimit =
  /*#__PURE__*/ createUseReadContract({
    abi: dailyRewardsV2Abi,
    address: dailyRewardsV2Address,
    functionName: "dailyClaimLimit",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dailyRewardsV2Abi}__ and `functionName` set to `"dailyGMContract"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useReadDailyRewardsV2DailyGmContract =
  /*#__PURE__*/ createUseReadContract({
    abi: dailyRewardsV2Abi,
    address: dailyRewardsV2Address,
    functionName: "dailyGMContract",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dailyRewardsV2Abi}__ and `functionName` set to `"fidInfo"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useReadDailyRewardsV2FidInfo = /*#__PURE__*/ createUseReadContract(
  {
    abi: dailyRewardsV2Abi,
    address: dailyRewardsV2Address,
    functionName: "fidInfo",
  }
);

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dailyRewardsV2Abi}__ and `functionName` set to `"getVaultStatus"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useReadDailyRewardsV2GetVaultStatus =
  /*#__PURE__*/ createUseReadContract({
    abi: dailyRewardsV2Abi,
    address: dailyRewardsV2Address,
    functionName: "getVaultStatus",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dailyRewardsV2Abi}__ and `functionName` set to `"minVaultBalance"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useReadDailyRewardsV2MinVaultBalance =
  /*#__PURE__*/ createUseReadContract({
    abi: dailyRewardsV2Abi,
    address: dailyRewardsV2Address,
    functionName: "minVaultBalance",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dailyRewardsV2Abi}__ and `functionName` set to `"nonces"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useReadDailyRewardsV2Nonces = /*#__PURE__*/ createUseReadContract({
  abi: dailyRewardsV2Abi,
  address: dailyRewardsV2Address,
  functionName: "nonces",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dailyRewardsV2Abi}__ and `functionName` set to `"owner"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useReadDailyRewardsV2Owner = /*#__PURE__*/ createUseReadContract({
  abi: dailyRewardsV2Abi,
  address: dailyRewardsV2Address,
  functionName: "owner",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dailyRewardsV2Abi}__ and `functionName` set to `"pendingOwner"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useReadDailyRewardsV2PendingOwner =
  /*#__PURE__*/ createUseReadContract({
    abi: dailyRewardsV2Abi,
    address: dailyRewardsV2Address,
    functionName: "pendingOwner",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dailyRewardsV2Abi}__ and `functionName` set to `"rewardToken"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useReadDailyRewardsV2RewardToken =
  /*#__PURE__*/ createUseReadContract({
    abi: dailyRewardsV2Abi,
    address: dailyRewardsV2Address,
    functionName: "rewardToken",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dailyRewardsV2Abi}__ and `functionName` set to `"usedSignatures"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useReadDailyRewardsV2UsedSignatures =
  /*#__PURE__*/ createUseReadContract({
    abi: dailyRewardsV2Abi,
    address: dailyRewardsV2Address,
    functionName: "usedSignatures",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dailyRewardsV2Abi}__ and `functionName` set to `"userInfo"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useReadDailyRewardsV2UserInfo =
  /*#__PURE__*/ createUseReadContract({
    abi: dailyRewardsV2Abi,
    address: dailyRewardsV2Address,
    functionName: "userInfo",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dailyRewardsV2Abi}__
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useWriteDailyRewardsV2 = /*#__PURE__*/ createUseWriteContract({
  abi: dailyRewardsV2Abi,
  address: dailyRewardsV2Address,
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dailyRewardsV2Abi}__ and `functionName` set to `"acceptOwnership"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useWriteDailyRewardsV2AcceptOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: dailyRewardsV2Abi,
    address: dailyRewardsV2Address,
    functionName: "acceptOwnership",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dailyRewardsV2Abi}__ and `functionName` set to `"claim"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useWriteDailyRewardsV2Claim = /*#__PURE__*/ createUseWriteContract(
  {
    abi: dailyRewardsV2Abi,
    address: dailyRewardsV2Address,
    functionName: "claim",
  }
);

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dailyRewardsV2Abi}__ and `functionName` set to `"deposit"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useWriteDailyRewardsV2Deposit =
  /*#__PURE__*/ createUseWriteContract({
    abi: dailyRewardsV2Abi,
    address: dailyRewardsV2Address,
    functionName: "deposit",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dailyRewardsV2Abi}__ and `functionName` set to `"emergencyWithdraw"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useWriteDailyRewardsV2EmergencyWithdraw =
  /*#__PURE__*/ createUseWriteContract({
    abi: dailyRewardsV2Abi,
    address: dailyRewardsV2Address,
    functionName: "emergencyWithdraw",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dailyRewardsV2Abi}__ and `functionName` set to `"invalidatePendingSignatures"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useWriteDailyRewardsV2InvalidatePendingSignatures =
  /*#__PURE__*/ createUseWriteContract({
    abi: dailyRewardsV2Abi,
    address: dailyRewardsV2Address,
    functionName: "invalidatePendingSignatures",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dailyRewardsV2Abi}__ and `functionName` set to `"renounceOwnership"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useWriteDailyRewardsV2RenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: dailyRewardsV2Abi,
    address: dailyRewardsV2Address,
    functionName: "renounceOwnership",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dailyRewardsV2Abi}__ and `functionName` set to `"setBackendSigner"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useWriteDailyRewardsV2SetBackendSigner =
  /*#__PURE__*/ createUseWriteContract({
    abi: dailyRewardsV2Abi,
    address: dailyRewardsV2Address,
    functionName: "setBackendSigner",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dailyRewardsV2Abi}__ and `functionName` set to `"setClaimRewardAmount"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useWriteDailyRewardsV2SetClaimRewardAmount =
  /*#__PURE__*/ createUseWriteContract({
    abi: dailyRewardsV2Abi,
    address: dailyRewardsV2Address,
    functionName: "setClaimRewardAmount",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dailyRewardsV2Abi}__ and `functionName` set to `"setDailyClaimLimit"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useWriteDailyRewardsV2SetDailyClaimLimit =
  /*#__PURE__*/ createUseWriteContract({
    abi: dailyRewardsV2Abi,
    address: dailyRewardsV2Address,
    functionName: "setDailyClaimLimit",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dailyRewardsV2Abi}__ and `functionName` set to `"setDailyGMContract"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useWriteDailyRewardsV2SetDailyGmContract =
  /*#__PURE__*/ createUseWriteContract({
    abi: dailyRewardsV2Abi,
    address: dailyRewardsV2Address,
    functionName: "setDailyGMContract",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dailyRewardsV2Abi}__ and `functionName` set to `"setMinVaultBalance"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useWriteDailyRewardsV2SetMinVaultBalance =
  /*#__PURE__*/ createUseWriteContract({
    abi: dailyRewardsV2Abi,
    address: dailyRewardsV2Address,
    functionName: "setMinVaultBalance",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dailyRewardsV2Abi}__ and `functionName` set to `"setRewardToken"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useWriteDailyRewardsV2SetRewardToken =
  /*#__PURE__*/ createUseWriteContract({
    abi: dailyRewardsV2Abi,
    address: dailyRewardsV2Address,
    functionName: "setRewardToken",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dailyRewardsV2Abi}__ and `functionName` set to `"transferOwnership"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useWriteDailyRewardsV2TransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: dailyRewardsV2Abi,
    address: dailyRewardsV2Address,
    functionName: "transferOwnership",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dailyRewardsV2Abi}__ and `functionName` set to `"updateBlacklist"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useWriteDailyRewardsV2UpdateBlacklist =
  /*#__PURE__*/ createUseWriteContract({
    abi: dailyRewardsV2Abi,
    address: dailyRewardsV2Address,
    functionName: "updateBlacklist",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dailyRewardsV2Abi}__
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useSimulateDailyRewardsV2 =
  /*#__PURE__*/ createUseSimulateContract({
    abi: dailyRewardsV2Abi,
    address: dailyRewardsV2Address,
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dailyRewardsV2Abi}__ and `functionName` set to `"acceptOwnership"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useSimulateDailyRewardsV2AcceptOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: dailyRewardsV2Abi,
    address: dailyRewardsV2Address,
    functionName: "acceptOwnership",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dailyRewardsV2Abi}__ and `functionName` set to `"claim"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useSimulateDailyRewardsV2Claim =
  /*#__PURE__*/ createUseSimulateContract({
    abi: dailyRewardsV2Abi,
    address: dailyRewardsV2Address,
    functionName: "claim",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dailyRewardsV2Abi}__ and `functionName` set to `"deposit"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useSimulateDailyRewardsV2Deposit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: dailyRewardsV2Abi,
    address: dailyRewardsV2Address,
    functionName: "deposit",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dailyRewardsV2Abi}__ and `functionName` set to `"emergencyWithdraw"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useSimulateDailyRewardsV2EmergencyWithdraw =
  /*#__PURE__*/ createUseSimulateContract({
    abi: dailyRewardsV2Abi,
    address: dailyRewardsV2Address,
    functionName: "emergencyWithdraw",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dailyRewardsV2Abi}__ and `functionName` set to `"invalidatePendingSignatures"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useSimulateDailyRewardsV2InvalidatePendingSignatures =
  /*#__PURE__*/ createUseSimulateContract({
    abi: dailyRewardsV2Abi,
    address: dailyRewardsV2Address,
    functionName: "invalidatePendingSignatures",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dailyRewardsV2Abi}__ and `functionName` set to `"renounceOwnership"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useSimulateDailyRewardsV2RenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: dailyRewardsV2Abi,
    address: dailyRewardsV2Address,
    functionName: "renounceOwnership",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dailyRewardsV2Abi}__ and `functionName` set to `"setBackendSigner"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useSimulateDailyRewardsV2SetBackendSigner =
  /*#__PURE__*/ createUseSimulateContract({
    abi: dailyRewardsV2Abi,
    address: dailyRewardsV2Address,
    functionName: "setBackendSigner",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dailyRewardsV2Abi}__ and `functionName` set to `"setClaimRewardAmount"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useSimulateDailyRewardsV2SetClaimRewardAmount =
  /*#__PURE__*/ createUseSimulateContract({
    abi: dailyRewardsV2Abi,
    address: dailyRewardsV2Address,
    functionName: "setClaimRewardAmount",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dailyRewardsV2Abi}__ and `functionName` set to `"setDailyClaimLimit"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useSimulateDailyRewardsV2SetDailyClaimLimit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: dailyRewardsV2Abi,
    address: dailyRewardsV2Address,
    functionName: "setDailyClaimLimit",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dailyRewardsV2Abi}__ and `functionName` set to `"setDailyGMContract"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useSimulateDailyRewardsV2SetDailyGmContract =
  /*#__PURE__*/ createUseSimulateContract({
    abi: dailyRewardsV2Abi,
    address: dailyRewardsV2Address,
    functionName: "setDailyGMContract",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dailyRewardsV2Abi}__ and `functionName` set to `"setMinVaultBalance"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useSimulateDailyRewardsV2SetMinVaultBalance =
  /*#__PURE__*/ createUseSimulateContract({
    abi: dailyRewardsV2Abi,
    address: dailyRewardsV2Address,
    functionName: "setMinVaultBalance",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dailyRewardsV2Abi}__ and `functionName` set to `"setRewardToken"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useSimulateDailyRewardsV2SetRewardToken =
  /*#__PURE__*/ createUseSimulateContract({
    abi: dailyRewardsV2Abi,
    address: dailyRewardsV2Address,
    functionName: "setRewardToken",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dailyRewardsV2Abi}__ and `functionName` set to `"transferOwnership"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useSimulateDailyRewardsV2TransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: dailyRewardsV2Abi,
    address: dailyRewardsV2Address,
    functionName: "transferOwnership",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dailyRewardsV2Abi}__ and `functionName` set to `"updateBlacklist"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useSimulateDailyRewardsV2UpdateBlacklist =
  /*#__PURE__*/ createUseSimulateContract({
    abi: dailyRewardsV2Abi,
    address: dailyRewardsV2Address,
    functionName: "updateBlacklist",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link dailyRewardsV2Abi}__
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useWatchDailyRewardsV2Event =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: dailyRewardsV2Abi,
    address: dailyRewardsV2Address,
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link dailyRewardsV2Abi}__ and `eventName` set to `"BackendSignerUpdated"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useWatchDailyRewardsV2BackendSignerUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: dailyRewardsV2Abi,
    address: dailyRewardsV2Address,
    eventName: "BackendSignerUpdated",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link dailyRewardsV2Abi}__ and `eventName` set to `"BlacklistUpdated"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useWatchDailyRewardsV2BlacklistUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: dailyRewardsV2Abi,
    address: dailyRewardsV2Address,
    eventName: "BlacklistUpdated",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link dailyRewardsV2Abi}__ and `eventName` set to `"ClaimRewardAmountUpdated"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useWatchDailyRewardsV2ClaimRewardAmountUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: dailyRewardsV2Abi,
    address: dailyRewardsV2Address,
    eventName: "ClaimRewardAmountUpdated",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link dailyRewardsV2Abi}__ and `eventName` set to `"Claimed"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useWatchDailyRewardsV2ClaimedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: dailyRewardsV2Abi,
    address: dailyRewardsV2Address,
    eventName: "Claimed",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link dailyRewardsV2Abi}__ and `eventName` set to `"DailyClaimLimitReached"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useWatchDailyRewardsV2DailyClaimLimitReachedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: dailyRewardsV2Abi,
    address: dailyRewardsV2Address,
    eventName: "DailyClaimLimitReached",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link dailyRewardsV2Abi}__ and `eventName` set to `"DailyClaimLimitUpdated"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useWatchDailyRewardsV2DailyClaimLimitUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: dailyRewardsV2Abi,
    address: dailyRewardsV2Address,
    eventName: "DailyClaimLimitUpdated",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link dailyRewardsV2Abi}__ and `eventName` set to `"DailyGMContractUpdated"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useWatchDailyRewardsV2DailyGmContractUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: dailyRewardsV2Abi,
    address: dailyRewardsV2Address,
    eventName: "DailyGMContractUpdated",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link dailyRewardsV2Abi}__ and `eventName` set to `"MinVaultBalanceUpdated"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useWatchDailyRewardsV2MinVaultBalanceUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: dailyRewardsV2Abi,
    address: dailyRewardsV2Address,
    eventName: "MinVaultBalanceUpdated",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link dailyRewardsV2Abi}__ and `eventName` set to `"OwnershipTransferStarted"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useWatchDailyRewardsV2OwnershipTransferStartedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: dailyRewardsV2Abi,
    address: dailyRewardsV2Address,
    eventName: "OwnershipTransferStarted",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link dailyRewardsV2Abi}__ and `eventName` set to `"OwnershipTransferred"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useWatchDailyRewardsV2OwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: dailyRewardsV2Abi,
    address: dailyRewardsV2Address,
    eventName: "OwnershipTransferred",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link dailyRewardsV2Abi}__ and `eventName` set to `"RewardTokenUpdated"`
 *
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0xEb08287D653021f18dd8D34AA86A9C0c947f5D20)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xE61bbb9714F2Cda01563d686AC444Fc788fE4D07)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x89a53126Ef99B0bf721b63216829c8C7C66F8D47)
 */
export const useWatchDailyRewardsV2RewardTokenUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: dailyRewardsV2Abi,
    address: dailyRewardsV2Address,
    eventName: "RewardTokenUpdated",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__
 */
export const useReadErc20 = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"allowance"`
 */
export const useReadErc20Allowance = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: "allowance",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadErc20BalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: "balanceOf",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"decimals"`
 */
export const useReadErc20Decimals = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: "decimals",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"name"`
 */
export const useReadErc20Name = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: "name",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"symbol"`
 */
export const useReadErc20Symbol = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: "symbol",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadErc20TotalSupply = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: "totalSupply",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20Abi}__
 */
export const useWriteErc20 = /*#__PURE__*/ createUseWriteContract({
  abi: erc20Abi,
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"approve"`
 */
export const useWriteErc20Approve = /*#__PURE__*/ createUseWriteContract({
  abi: erc20Abi,
  functionName: "approve",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transfer"`
 */
export const useWriteErc20Transfer = /*#__PURE__*/ createUseWriteContract({
  abi: erc20Abi,
  functionName: "transfer",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteErc20TransferFrom = /*#__PURE__*/ createUseWriteContract({
  abi: erc20Abi,
  functionName: "transferFrom",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20Abi}__
 */
export const useSimulateErc20 = /*#__PURE__*/ createUseSimulateContract({
  abi: erc20Abi,
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"approve"`
 */
export const useSimulateErc20Approve = /*#__PURE__*/ createUseSimulateContract({
  abi: erc20Abi,
  functionName: "approve",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transfer"`
 */
export const useSimulateErc20Transfer = /*#__PURE__*/ createUseSimulateContract(
  { abi: erc20Abi, functionName: "transfer" }
);

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateErc20TransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: erc20Abi,
    functionName: "transferFrom",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc20Abi}__
 */
export const useWatchErc20Event = /*#__PURE__*/ createUseWatchContractEvent({
  abi: erc20Abi,
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc20Abi}__ and `eventName` set to `"Approval"`
 */
export const useWatchErc20ApprovalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: erc20Abi,
    eventName: "Approval",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc20Abi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchErc20TransferEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: erc20Abi,
    eventName: "Transfer",
  });
