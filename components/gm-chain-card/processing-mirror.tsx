"use client";

import React, { useEffect } from "react";

type TransactionStatus = "default" | "success" | "error" | "pending";

type ProcessingMirrorProps = {
  status: TransactionStatus;
  onChange: (pending: boolean) => void;
};

export const ProcessingMirror = React.memo(
  ({ status, onChange }: ProcessingMirrorProps) => {
    useEffect(() => {
      onChange(status === "pending");
    }, [status, onChange]);
    return null;
  }
);
