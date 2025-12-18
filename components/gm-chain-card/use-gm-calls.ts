import { useMemo } from "react";
import { type Address, isAddress } from "viem";
import { dailyGMAbi } from "@/lib/abi/daily-gm";

type UseGMCallsParams = {
  contractAddress: Address;
  transactionType: "gm" | "gmTo";
  recipient?: string;
};

export const useGMCalls = ({
  contractAddress,
  transactionType,
  recipient,
}: UseGMCallsParams) =>
  useMemo(() => {
    if (transactionType === "gm") {
      return [
        {
          abi: dailyGMAbi,
          address: contractAddress,
          functionName: "gm" as const,
        },
      ];
    }

    const hasValidRecipient = recipient && isAddress(recipient);
    if (transactionType !== "gmTo" || !hasValidRecipient) {
      return [];
    }

    return [
      {
        abi: dailyGMAbi,
        address: contractAddress,
        functionName: "gmTo" as const,
        args: [recipient as Address],
      },
    ];
  }, [contractAddress, transactionType, recipient]);
