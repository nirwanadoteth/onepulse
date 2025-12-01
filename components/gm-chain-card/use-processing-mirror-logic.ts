import { useEffect } from "react";

type TransactionStatus = "default" | "success" | "error" | "pending";

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
