"use client";

import { memo } from "react";
import type { TransactionStatus } from "@/types/transaction";
import { useProcessingMirrorLogic } from "./use-processing-mirror-logic";

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
