import type { Address } from "viem";
import { useGMCalls } from "./use-gm-calls";

type UseGMTransactionLogicProps = {
  contractAddress: Address;
  transactionType: "gm" | "gmTo";
  recipient?: string;
};

export function useGMTransactionLogic({
  contractAddress,
  transactionType,
  recipient,
}: UseGMTransactionLogicProps) {
  const calls = useGMCalls({
    contractAddress,
    transactionType,
    recipient,
  });

  const hasCalls = calls.length > 0;

  return {
    calls,
    hasCalls,
  };
}
