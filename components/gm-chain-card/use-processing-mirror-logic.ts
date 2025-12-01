import { useEffect } from "react";
import type { TransactionStatus } from "@/types/transaction";

type UseProcessingMirrorLogicProps = {
  status: TransactionStatus;
  onChange: (pending: boolean) => void;
};

export const useProcessingMirrorLogic = ({
  status,
  onChange,
}: UseProcessingMirrorLogicProps) => {
  useEffect(() => {
    onChange(status === "pending");
  }, [status, onChange]);
};
