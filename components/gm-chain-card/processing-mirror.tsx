import type { TransactionStatus } from "@/types/transaction";
import { useProcessingMirrorLogic } from "./use-processing-mirror-logic";

type ProcessingMirrorProps = {
  status: TransactionStatus;
  onChange: (pending: boolean) => void;
};

export function ProcessingMirror({ status, onChange }: ProcessingMirrorProps) {
  useProcessingMirrorLogic({ status, onChange });
  return null;
}
