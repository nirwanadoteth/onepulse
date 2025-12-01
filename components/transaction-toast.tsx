"use client";

import { useTransactionToast } from "./transaction-toast/use-transaction-toast";

export function TransactionToast(props: {
  className?: string;
  position?: "top-center" | "bottom-center";
  label?: string;
  onStatusChangeAction?: (status: string) => void;
}) {
  useTransactionToast(props);
  return null;
}
