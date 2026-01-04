import { useTransactionContext } from "@/components/ui/custom-transaction";

export function useSafeTransactionContext() {
  const context = useTransactionContext();
  try {
    return context;
  } catch {
    return {
      errorMessage: undefined,
      isLoading: false,
      isToastVisible: false,
      receipt: undefined,
      transactionHash: undefined,
      transactionId: undefined,
      onSubmit: undefined,
      chainId: undefined,
      lifecycleStatus: { statusName: "init" },
    } as unknown as ReturnType<typeof useTransactionContext>;
  }
}
