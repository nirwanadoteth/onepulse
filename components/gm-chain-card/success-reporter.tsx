import type { ChainId } from "@/lib/constants";
import type { TransactionStatus } from "@/types/transaction";
import { useSuccessReporterLogic } from "./use-success-reporter-logic";

type SuccessReporterProps = {
  status: TransactionStatus;
  address: `0x${string}`;
  chainId: ChainId;
  txHash?: string;
};

export function SuccessReporter({
  status,
  address,
  chainId,
  txHash,
}: SuccessReporterProps) {
  useSuccessReporterLogic({
    status,
    address,
    chainId,
    txHash,
  });

  return null;
}
