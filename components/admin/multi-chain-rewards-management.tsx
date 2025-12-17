"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatUnits, parseUnits } from "viem";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDailyRewardsV2Config } from "@/hooks/use-daily-rewards-v2-config";
import { useDailyRewardsV2Read } from "@/hooks/use-daily-rewards-v2-read";
import { dailyRewardsV2Abi } from "@/lib/abi/daily-rewards-v2";
import { ERC20_ABI } from "@/lib/abi/erc20";

export function MultiChainRewardsManagement() {
  const {
    selectedChainId,
    setSelectedChainId,
    getChainName,
    supportedChains,
    currentContractAddress,
    currentTokenAddress,
    currentTokenSymbol,
    currentTokenDecimals,
  } = useDailyRewardsV2Config();
  const rewardStatus = useDailyRewardsV2Read(currentContractAddress);

  const [newClaimRewardAmount, setNewClaimRewardAmount] = useState("");
  const [newMinVaultBalance, setNewMinVaultBalance] = useState("");
  const [newDailyClaimLimit, setNewDailyClaimLimit] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [approvedAmount, setApprovedAmount] = useState<bigint | null>(null);
  const [pendingDepositAmount, setPendingDepositAmount] = useState<
    bigint | null
  >(null);

  const { writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash: undefined,
  });

  const isLoading = isPending || isConfirming;

  useEffect(() => {
    if (rewardStatus.claimRewardAmount) {
      setNewClaimRewardAmount(
        formatUnits(rewardStatus.claimRewardAmount, currentTokenDecimals)
      );
    }
    if (rewardStatus.minVaultBalance) {
      setNewMinVaultBalance(
        formatUnits(rewardStatus.minVaultBalance, currentTokenDecimals)
      );
    }
    if (rewardStatus.dailyClaimLimit) {
      setNewDailyClaimLimit(rewardStatus.dailyClaimLimit.toString());
    }
  }, [
    rewardStatus.claimRewardAmount,
    rewardStatus.minVaultBalance,
    rewardStatus.dailyClaimLimit,
    currentTokenDecimals,
  ]);

  useEffect(() => {
    if (isPending || isConfirming) {
      return;
    }

    if (pendingAction === "approve" && pendingDepositAmount) {
      setApprovedAmount(pendingDepositAmount);
      setPendingAction("deposit");
      setPendingDepositAmount(null);
      setShowConfirm(true);
      return;
    }

    if (!pendingAction) {
      return;
    }

    rewardStatus.refetch();
    setDepositAmount("");
    setWithdrawAmount("");
  }, [
    isPending,
    isConfirming,
    pendingAction,
    pendingDepositAmount,
    rewardStatus,
  ]);

  const handleUpdateClaimReward = () => {
    if (!newClaimRewardAmount || Number.isNaN(Number(newClaimRewardAmount))) {
      toast.error("Invalid reward amount");
      return;
    }

    setPendingAction("claimReward");
    setShowConfirm(true);
  };

  const handleUpdateMinVault = () => {
    if (!newMinVaultBalance || Number.isNaN(Number(newMinVaultBalance))) {
      toast.error("Invalid min vault balance");
      return;
    }

    setPendingAction("minVault");
    setShowConfirm(true);
  };

  const handleUpdateDailyLimit = () => {
    if (!newDailyClaimLimit || Number.isNaN(Number(newDailyClaimLimit))) {
      toast.error("Invalid daily claim limit");
      return;
    }

    setPendingAction("dailyLimit");
    setShowConfirm(true);
  };

  const handleDeposit = () => {
    if (!depositAmount || Number.isNaN(Number(depositAmount))) {
      toast.error("Invalid deposit amount");
      return;
    }

    const depositAmountParsed = parseUnits(depositAmount, currentTokenDecimals);

    if (approvedAmount === null || approvedAmount < depositAmountParsed) {
      setPendingAction("approve");
      setShowConfirm(true);
    } else {
      setPendingAction("deposit");
      setShowConfirm(true);
    }
  };

  const handleWithdraw = () => {
    if (!withdrawAmount || Number.isNaN(Number(withdrawAmount))) {
      toast.error("Invalid withdraw amount");
      return;
    }

    setPendingAction("withdraw");
    setShowConfirm(true);
  };

  const executeApprove = () => {
    if (!currentTokenAddress) {
      toast.error("Token address not available");
      return;
    }

    if (!currentContractAddress) {
      toast.error("Contract address not available");
      return;
    }

    const depositAmountParsed = parseUnits(depositAmount, currentTokenDecimals);
    writeContract({
      address: currentTokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [currentContractAddress as `0x${string}`, depositAmountParsed],
    });
    setPendingDepositAmount(depositAmountParsed);
  };

  const executeParameterUpdate = () => {
    if (!currentContractAddress) {
      toast.error("Contract address not available");
      return;
    }

    if (pendingAction === "claimReward") {
      const parsed = parseUnits(newClaimRewardAmount, currentTokenDecimals);
      writeContract({
        address: currentContractAddress,
        abi: dailyRewardsV2Abi,
        functionName: "setClaimRewardAmount",
        args: [parsed],
      });
    } else if (pendingAction === "minVault") {
      const parsed = parseUnits(newMinVaultBalance, currentTokenDecimals);
      writeContract({
        address: currentContractAddress,
        abi: dailyRewardsV2Abi,
        functionName: "setMinVaultBalance",
        args: [parsed],
      });
    } else if (pendingAction === "dailyLimit") {
      const parsed = BigInt(newDailyClaimLimit);
      writeContract({
        address: currentContractAddress,
        abi: dailyRewardsV2Abi,
        functionName: "setDailyClaimLimit",
        args: [parsed],
      });
    }
  };

  const executeVaultOperation = () => {
    if (!currentContractAddress) {
      toast.error("Contract address not available");
      return;
    }

    if (pendingAction === "deposit") {
      const parsed = parseUnits(depositAmount, currentTokenDecimals);
      writeContract({
        address: currentContractAddress,
        abi: dailyRewardsV2Abi,
        functionName: "deposit",
        args: [parsed],
      });
    } else if (pendingAction === "withdraw") {
      const parsed = parseUnits(withdrawAmount, currentTokenDecimals);
      writeContract({
        address: currentContractAddress,
        abi: dailyRewardsV2Abi,
        functionName: "emergencyWithdraw",
        args: [parsed],
      });
    }
  };

  const confirmAction = () => {
    try {
      if (pendingAction === "approve") {
        executeApprove();
      } else if (
        pendingAction === "claimReward" ||
        pendingAction === "minVault" ||
        pendingAction === "dailyLimit"
      ) {
        executeParameterUpdate();
      } else if (pendingAction === "deposit" || pendingAction === "withdraw") {
        executeVaultOperation();
      }
    } catch (error) {
      toast.error("Failed to execute transaction");
      console.error(error);
    } finally {
      setShowConfirm(false);
    }
  };

  const getConfirmDialogTitle = () => {
    if (pendingAction === "approve") {
      return "Approve Token Transfer";
    }
    if (pendingAction === "deposit" || pendingAction === "withdraw") {
      return "Confirm Vault Operation";
    }
    return "Confirm Update";
  };

  if (rewardStatus.isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Multi-Chain Rewards Management</CardTitle>
        <CardDescription>
          Manage Daily Rewards V2 contracts across Base, Celo, and Optimism
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs
          className="w-full"
          onValueChange={(value) => setSelectedChainId(Number(value))}
          value={selectedChainId.toString()}
        >
          <TabsList className="grid w-full grid-cols-3">
            {supportedChains.map((chainId) => (
              <TabsTrigger key={chainId} value={chainId.toString()}>
                {getChainName(chainId)}
              </TabsTrigger>
            ))}
          </TabsList>

          {supportedChains.map((chainId) => (
            <TabsContent key={chainId} value={chainId.toString()}>
              <div className="space-y-4">
                {/* Contract Overview */}
                <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
                  <h3 className="font-semibold">
                    {getChainName(chainId)} Overview
                  </h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="space-y-1">
                      <div className="text-muted-foreground text-xs">
                        Vault Balance
                      </div>
                      <div className="font-mono text-sm">
                        {rewardStatus.vaultStatus
                          ? `${Number(
                              formatUnits(
                                rewardStatus.vaultStatus.currentBalance,
                                currentTokenDecimals
                              )
                            ).toLocaleString(undefined, {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 6,
                            })} ${currentTokenSymbol}`
                          : "—"}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-muted-foreground text-xs">
                        Available for Claims
                      </div>
                      <div className="font-mono text-green-600 text-sm dark:text-green-400">
                        {rewardStatus.vaultStatus
                          ? `${Number(
                              formatUnits(
                                rewardStatus.vaultStatus.availableForClaims,
                                currentTokenDecimals
                              )
                            ).toLocaleString(undefined, {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 6,
                            })} ${currentTokenSymbol}`
                          : "—"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Claim Reward Amount */}
                <div className="space-y-2">
                  <Label htmlFor="claim-reward">
                    Claim Reward Amount ({currentTokenSymbol})
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      disabled={isLoading}
                      id="claim-reward"
                      onChange={(e) => setNewClaimRewardAmount(e.target.value)}
                      placeholder="e.g., 0.01"
                      step="0.01"
                      type="number"
                      value={newClaimRewardAmount}
                    />
                    <Button
                      disabled={isLoading}
                      onClick={handleUpdateClaimReward}
                      size="sm"
                    >
                      {isLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Update
                    </Button>
                  </div>
                </div>

                {/* Min Vault Balance */}
                <div className="space-y-2">
                  <Label htmlFor="min-vault">
                    Min Vault Balance ({currentTokenSymbol})
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      disabled={isLoading}
                      id="min-vault"
                      onChange={(e) => setNewMinVaultBalance(e.target.value)}
                      placeholder="e.g., 1"
                      step="0.01"
                      type="number"
                      value={newMinVaultBalance}
                    />
                    <Button
                      disabled={isLoading}
                      onClick={handleUpdateMinVault}
                      size="sm"
                    >
                      {isLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Update
                    </Button>
                  </div>
                </div>

                {/* Daily Claim Limit */}
                <div className="space-y-2">
                  <Label htmlFor="daily-limit">
                    Daily Claim Limit (claims/day)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      disabled={isLoading}
                      id="daily-limit"
                      onChange={(e) => setNewDailyClaimLimit(e.target.value)}
                      placeholder="e.g., 250"
                      step="1"
                      type="number"
                      value={newDailyClaimLimit}
                    />
                    <Button
                      disabled={isLoading}
                      onClick={handleUpdateDailyLimit}
                      size="sm"
                    >
                      {isLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Update
                    </Button>
                  </div>
                </div>

                {/* Deposit */}
                <div className="space-y-2">
                  <Label htmlFor="deposit">
                    Deposit ({currentTokenSymbol})
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      disabled={isLoading}
                      id="deposit"
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="e.g., 100"
                      step="0.01"
                      type="number"
                      value={depositAmount}
                    />
                    <Button
                      disabled={isLoading}
                      onClick={handleDeposit}
                      size="sm"
                      variant="default"
                    >
                      {isLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Deposit
                    </Button>
                  </div>
                </div>

                {/* Withdraw */}
                <div className="space-y-2">
                  <Label htmlFor="withdraw">
                    Withdraw ({currentTokenSymbol})
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      disabled={isLoading}
                      id="withdraw"
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="e.g., 50"
                      step="0.01"
                      type="number"
                      value={withdrawAmount}
                    />
                    <Button
                      disabled={isLoading}
                      onClick={handleWithdraw}
                      size="sm"
                      variant="destructive"
                    >
                      {isLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Withdraw
                    </Button>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950">
                  <div className="flex gap-2">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <div className="space-y-1 text-amber-700 text-xs dark:text-amber-200">
                      <p>
                        <strong>Current Settings:</strong>
                      </p>
                      <p>
                        • Reward:{" "}
                        {rewardStatus.claimRewardAmount
                          ? formatUnits(
                              rewardStatus.claimRewardAmount,
                              currentTokenDecimals
                            )
                          : "—"}{" "}
                        {currentTokenSymbol}
                      </p>
                      <p>
                        • Min Reserve:{" "}
                        {rewardStatus.minVaultBalance
                          ? formatUnits(
                              rewardStatus.minVaultBalance,
                              currentTokenDecimals
                            )
                          : "—"}{" "}
                        {currentTokenSymbol}
                      </p>
                      <p>
                        • Daily Limit:{" "}
                        {rewardStatus.dailyClaimLimit?.toString() ?? "—"}{" "}
                        claims/day
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>

      {/* Confirmation Dialog */}
      <AlertDialog onOpenChange={setShowConfirm} open={showConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{getConfirmDialogTitle()}</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction === "approve" &&
                `Grant approval to transfer ${depositAmount} ${currentTokenSymbol} to the vault contract on ${getChainName(selectedChainId)}.`}
              {pendingAction === "claimReward" &&
                `Update claim reward amount to ${newClaimRewardAmount} ${currentTokenSymbol} on ${getChainName(selectedChainId)}?`}
              {pendingAction === "minVault" &&
                `Update min vault balance to ${newMinVaultBalance} ${currentTokenSymbol} on ${getChainName(selectedChainId)}?`}
              {pendingAction === "dailyLimit" &&
                `Update daily claim limit to ${newDailyClaimLimit} claims/day on ${getChainName(selectedChainId)}?`}
              {pendingAction === "deposit" &&
                `Deposit ${depositAmount} ${currentTokenSymbol} to vault on ${getChainName(selectedChainId)}?`}
              {pendingAction === "withdraw" &&
                `Withdraw ${withdrawAmount} ${currentTokenSymbol} from vault on ${getChainName(selectedChainId)}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={isLoading} onClick={confirmAction}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {pendingAction === "deposit" && "Deposit"}
              {pendingAction === "withdraw" && "Withdraw"}
              {pendingAction !== "deposit" &&
                pendingAction !== "withdraw" &&
                "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
