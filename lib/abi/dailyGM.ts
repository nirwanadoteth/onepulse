export const dailyGMAbi = [
  {
    type: "function",
    name: "gm",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "gmTo",
    stateMutability: "nonpayable",
    inputs: [
      { name: "recipient", type: "address" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "lastGMDay",
    stateMutability: "view",
    inputs: [ { name: "user", type: "address" } ],
    outputs: [ { type: "uint256" } ],
  },
  {
    type: "event",
    name: "GM",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "recipient", type: "address", indexed: true },
    ],
    anonymous: false,
  },
] as const;
