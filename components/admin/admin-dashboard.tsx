"use client";

import { type Address, formatUnits } from "viem";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDailyRewardsV2Config } from "@/hooks/use-daily-rewards-v2-config";
import { useDailyRewardsV2Read } from "@/hooks/use-daily-rewards-v2-read";
import { useErc20Metadata } from "@/hooks/use-erc20-metadata";
import { BlacklistManagementCard } from "./blacklist-management-card";
import { ChainVisibilityControls } from "./chain-visibility-controls";
import { ContractSettingsCard } from "./contract-settings-card";
import { OwnershipCard } from "./ownership-card";
import { VaultStatusCard } from "./vault-status-card";

function isValidAddress(address: string | undefined): address is Address {
  return (
    typeof address === "string" &&
    address.startsWith("0x") &&
    address.length === 42
  );
}

type ContractOverviewProps = {
  chainName: string;
  currentTokenDecimals: number;
  currentTokenSymbol: string;
  currentBalance: bigint | undefined;
  claimRewardAmount: bigint | undefined;
  minVaultBalance: bigint | undefined;
  dailyClaimLimit: bigint | undefined;
};

function ContractOverview({
  chainName,
  currentTokenDecimals,
  currentTokenSymbol,
  currentBalance,
  claimRewardAmount,
  minVaultBalance,
  dailyClaimLimit,
}: ContractOverviewProps) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="mb-4 font-semibold text-lg">
        {chainName} Contract Overview
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1">
          <div className="text-muted-foreground text-sm">Vault Balance</div>
          <div className="font-bold text-lg">
            {currentBalance
              ? `${Number(
                  formatUnits(currentBalance, currentTokenDecimals)
                ).toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 6,
                })} ${currentTokenSymbol}`
              : "—"}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-muted-foreground text-sm">Min Reserve</div>
          <div className="font-bold text-lg">
            {minVaultBalance
              ? `${Number(
                  formatUnits(minVaultBalance, currentTokenDecimals)
                ).toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 6,
                })} ${currentTokenSymbol}`
              : "—"}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-muted-foreground text-sm">Daily Reward</div>
          <div className="font-bold text-lg">
            {claimRewardAmount
              ? `${Number(
                  formatUnits(claimRewardAmount, currentTokenDecimals)
                ).toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 6,
                })} ${currentTokenSymbol}`
              : "—"}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-muted-foreground text-sm">Daily Claim Limit</div>
          <div className="font-bold text-lg">
            {dailyClaimLimit ? Number(dailyClaimLimit) : 250}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const {
    selectedChainId,
    setSelectedChainId,
    getChainName,
    supportedChains,
    currentTokenAddress,
    currentContractAddress,
    currentTokenSymbol,
    currentTokenDecimals,
  } = useDailyRewardsV2Config();

  const {
    vaultStatus,
    claimRewardAmount,
    minVaultBalance,
    dailyClaimLimit,
    dailyGMContract,
    backendSigner,
    rewardToken,
    owner,
    pendingOwner,
    isLoading,
    refetch,
  } = useDailyRewardsV2Read(currentContractAddress, selectedChainId);

  // Fetch dynamic token metadata from the reward token contract
  const { decimals: dynamicTokenDecimals, symbol: dynamicTokenSymbol } =
    useErc20Metadata(
      (rewardToken || currentTokenAddress) as Address | undefined,
      selectedChainId
    );

  // Use dynamic metadata if available, fall back to configured values
  const tokenDecimals = dynamicTokenDecimals ?? currentTokenDecimals;
  const tokenSymbol = dynamicTokenSymbol ?? currentTokenSymbol;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading contract data...</div>
      </div>
    );
  }

  return (
    <Tabs
      onValueChange={(value) => setSelectedChainId(Number(value))}
      value={String(selectedChainId)}
    >
      <TabsList className="grid w-full grid-cols-3">
        {supportedChains.map((chainId) => (
          <TabsTrigger key={chainId} value={String(chainId)}>
            {getChainName(chainId)}
          </TabsTrigger>
        ))}
      </TabsList>

      <ScrollArea className="h-120 w-full">
        {supportedChains.map((chainId) => (
          <TabsContent
            className="space-y-2"
            key={chainId}
            value={String(chainId)}
          >
            {isValidAddress(currentContractAddress) &&
            isValidAddress(rewardToken || currentTokenAddress) ? (
              <>
                <ContractOverview
                  chainName={getChainName(chainId)}
                  claimRewardAmount={claimRewardAmount}
                  currentBalance={vaultStatus?.currentBalance}
                  currentTokenDecimals={tokenDecimals}
                  currentTokenSymbol={tokenSymbol}
                  dailyClaimLimit={dailyClaimLimit}
                  minVaultBalance={minVaultBalance}
                />

                <VaultStatusCard
                  chainId={selectedChainId}
                  contractAddress={currentContractAddress}
                  onRefetchAction={refetch}
                  tokenAddress={(rewardToken || currentTokenAddress) as Address}
                  tokenDecimals={tokenDecimals}
                  tokenSymbol={tokenSymbol}
                  vaultStatus={vaultStatus}
                />

                <ChainVisibilityControls />

                <ContractSettingsCard
                  backendSigner={backendSigner}
                  chainId={selectedChainId}
                  claimRewardAmount={claimRewardAmount}
                  contractAddress={currentContractAddress}
                  dailyClaimLimit={dailyClaimLimit}
                  dailyGMContract={dailyGMContract}
                  minVaultBalance={minVaultBalance}
                  onRefetchAction={refetch}
                  rewardToken={rewardToken}
                  tokenDecimals={tokenDecimals}
                  tokenSymbol={tokenSymbol}
                />

                <BlacklistManagementCard
                  contractAddress={currentContractAddress}
                  onRefetchAction={refetch}
                />

                <OwnershipCard
                  contractAddress={currentContractAddress}
                  onRefetchAction={refetch}
                  owner={isValidAddress(owner) ? owner : undefined}
                  pendingOwner={
                    isValidAddress(pendingOwner) ? pendingOwner : undefined
                  }
                />
              </>
            ) : (
              <div className="flex items-center justify-center rounded-lg border border-dashed bg-muted/50 py-12">
                <div className="text-center text-muted-foreground">
                  No contract address found for {getChainName(chainId)}
                </div>
              </div>
            )}
          </TabsContent>
        ))}
      </ScrollArea>
    </Tabs>
  );
}
