import { useRewardVaultStatus } from "@/hooks/use-reward-claim";

export function useVaultBalanceLogic() {
  const { available, isPending } = useRewardVaultStatus();

  const formatBalance = (value: bigint) =>
    (Number(value) / 1e18).toLocaleString(undefined, {
      maximumFractionDigits: 2,
    });

  return {
    available,
    isPending,
    formatBalance,
  };
}
