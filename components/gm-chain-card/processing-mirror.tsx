"use client";

import { memo, useEffect } from "react";

type TransactionStatus = "default" | "success" | "error" | "pending";

type ProcessingMirrorProps = {
  status: TransactionStatus;
  onChange: (pending: boolean) => void;
};

export const ProcessingMirror = memo(
  ({ status, onChange }: ProcessingMirrorProps) => {
    useEffect(() => {
      onChange(status === "pending");
    }, [status, onChange]);
    return null;
  }
);
