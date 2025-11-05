export const dailyGMAbi = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      {
        indexed: true,
        internalType: "address",
        name: "recipient",
        type: "address",
      },
    ],
    name: "GM",
    type: "event",
  },
  {
    inputs: [],
    name: "gm",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "recipient", type: "address" }],
    name: "gmTo",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "lastGMDay",
    outputs: [{ internalType: "uint256", name: "lastGMDay", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const
