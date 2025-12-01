"use client";

import { memo } from "react";
import { useProcessingMirrorLogic } from "./use-processing-mirror-logic";

type TransactionStatus = "default" | "success" | "error" | "pending";

type ProcessingMirrorProps = {
  status: TransactionStatus;
  onChange: (pending: boolean) => void;
};

export const ProcessingMirror = memo(
  ({ status, onChange }: ProcessingMirrorProps) => {
    useProcessingMirrorLogic({ status, onChange });
    return null;
  }
);
