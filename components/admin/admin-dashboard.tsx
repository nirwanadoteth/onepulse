"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatEther } from "viem";
import { Button } from "@/components/ui/button";
import { useDailyRewardsRead } from "@/hooks/use-daily-rewards-read";
import { BlacklistManagementCard } from "./blacklist-management-card";
import { ContractSettingsCard } from "./contract-settings-card";
import { MultiChainRewardsManagement } from "./multi-chain-rewards-management";
import { OwnershipCard } from "./ownership-card";
import { VaultStatusCard } from "./vault-status-card";

function formatDegen(value: bigint | undefined): string {
  if (value === undefined) {
    return "—";
  }
  return `${Number(formatEther(value)).toLocaleString()} DEGEN`;
}

export function AdminDashboard() {
  const router = useRouter();
  const {
    vaultStatus,
    claimRewardAmount,
    minVaultBalance,
    dailyGMContract,
    backendSigner,
    owner,
    pendingOwner,
    isLoading,
    refetch,
    contractAddress,
  } = useDailyRewardsRead();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading contract data...</div>
      </div>
    );
  }

  const handleRefetch = () => {
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <Button
          className="flex items-center gap-2"
          onClick={() => router.back()}
          variant="outline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-center font-bold text-2xl">Admin Dashboard</h1>
        <div />
      </div>
      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 font-semibold text-lg">Contract Overview</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <div className="text-muted-foreground text-sm">Vault Balance</div>
            <div className="font-bold text-2xl">
              {formatDegen(vaultStatus?.currentBalance)}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground text-sm">Min Reserve</div>
            <div className="font-bold text-2xl">
              {formatDegen(minVaultBalance)}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground text-sm">Daily Reward</div>
            <div className="font-bold text-2xl">
              {formatDegen(claimRewardAmount)}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground text-sm">
              Available Claims
            </div>
            <div className="font-bold text-2xl text-green-600 dark:text-green-400">
              {formatDegen(vaultStatus?.availableForClaims)}
            </div>
          </div>
        </div>
      </div>
      <VaultStatusCard
        contractAddress={contractAddress}
        onRefetchAction={handleRefetch}
        vaultStatus={vaultStatus}
      />

      <ContractSettingsCard
        backendSigner={backendSigner}
        claimRewardAmount={claimRewardAmount}
        contractAddress={contractAddress}
        dailyGMContract={dailyGMContract}
        minVaultBalance={minVaultBalance}
        onRefetchAction={handleRefetch}
      />

      <BlacklistManagementCard
        contractAddress={contractAddress}
        onRefetchAction={handleRefetch}
      />

      <OwnershipCard
        contractAddress={contractAddress}
        onRefetchAction={handleRefetch}
        owner={owner}
        pendingOwner={pendingOwner}
      />

      <div className="border-t pt-8">
        <h2 className="mb-6 font-semibold text-lg">
          Multi-Chain Rewards Management (V2)
        </h2>
        <MultiChainRewardsManagement />
      </div>
    </div>
  );
}
