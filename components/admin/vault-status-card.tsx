"use client";

import { ArrowDownCircle, ArrowUpCircle, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { type Address, formatUnits, parseUnits } from "viem";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
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
import { dailyRewardsV2Abi } from "@/lib/abi/daily-rewards-v2";
import { ERC20_ABI } from "@/lib/abi/erc20";

type VaultStatus = {
  currentBalance: bigint;
  minReserve: bigint;
  availableForClaims: bigint;
};

type VaultStatusCardProps = {
  vaultStatus?: VaultStatus;
  contractAddress: Address;
  chainId: number;
  tokenAddress: Address;
  tokenSymbol: string;
  tokenDecimals: number;
  onRefetchAction: () => void;
};

export function VaultStatusCard({
  vaultStatus,
  contractAddress,
  chainId,
  tokenAddress,
  tokenSymbol,
  tokenDecimals,
  onRefetchAction,
}: VaultStatusCardProps) {
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [approvalStep, setApprovalStep] = useState(false);
  const [pendingDepositAmount, setPendingDepositAmount] = useState<
    bigint | null
  >(null);

  const {
    writeContract: approve,
    data: approvalHash,
    isPending: isApprovePending,
  } = useWriteContract();

  const {
    writeContract: deposit,
    data: depositHash,
    isPending: isDepositPending,
  } = useWriteContract();

  const {
    writeContract: withdraw,
    data: withdrawHash,
    isPending: isWithdrawPending,
  } = useWriteContract();

  const { isLoading: isApprovalConfirming } = useWaitForTransactionReceipt({
    hash: approvalHash,
  });

  const { isLoading: isDepositConfirming } = useWaitForTransactionReceipt({
    hash: depositHash,
  });

  const { isLoading: isWithdrawConfirming } = useWaitForTransactionReceipt({
    hash: withdrawHash,
  });

  useEffect(() => {
    if (isApprovalConfirming === false && approvalHash && !isApprovePending) {
      if (!pendingDepositAmount) {
        return;
      }

      toast.success("Approval confirmed! Now depositing...");
      deposit(
        {
          address: contractAddress,
          abi: dailyRewardsV2Abi,
          functionName: "deposit",
          args: [pendingDepositAmount],
          chainId,
        },
        {
          onSuccess: () => {
            toast.success("Deposit transaction submitted");
            setDepositAmount("");
            setApprovalStep(false);
            setPendingDepositAmount(null);
            onRefetchAction();
          },
          onError: (error) => {
            toast.error(error.message || "Deposit failed");
            setApprovalStep(false);
            setPendingDepositAmount(null);
          },
        }
      );
    }
  }, [
    isApprovalConfirming,
    approvalHash,
    isApprovePending,
    pendingDepositAmount,
    deposit,
    contractAddress,
    chainId,
    onRefetchAction,
  ]);

  const isDepositing = isDepositPending || isDepositConfirming;
  const isWithdrawing = isWithdrawPending || isWithdrawConfirming;

  const getDepositButtonText = () => {
    if (!isDepositing) {
      return "Deposit";
    }
    return approvalStep ? "Approving..." : "Depositing...";
  };

  const handleDeposit = () => {
    if (!depositAmount || Number.parseFloat(depositAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const parsed = parseUnits(depositAmount, tokenDecimals);
    setPendingDepositAmount(parsed);
    setApprovalStep(true);

    approve(
      {
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [contractAddress, parsed],
        chainId,
      },
      {
        onSuccess: () => {
          toast.info("Approval transaction submitted...");
        },
        onError: (error) => {
          toast.error(error.message || "Approval failed");
          setApprovalStep(false);
          setPendingDepositAmount(null);
        },
      }
    );
  };

  const handleWithdraw = () => {
    if (!withdrawAmount || Number.parseFloat(withdrawAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const parsed = parseUnits(withdrawAmount, tokenDecimals);
    withdraw(
      {
        address: contractAddress,
        abi: dailyRewardsV2Abi,
        functionName: "emergencyWithdraw",
        args: [parsed],
        chainId,
      },
      {
        onSuccess: () => {
          toast.success("Withdraw transaction submitted");
          setWithdrawAmount("");
          onRefetchAction();
        },
        onError: (error) => {
          toast.error(error.message || "Withdraw failed");
        },
      }
    );
  };

  const formatToken = (value?: bigint) => {
    if (value === undefined) {
      return "—";
    }
    return `${Number(formatUnits(value, tokenDecimals)).toLocaleString(undefined, { maximumFractionDigits: 3 })} ${tokenSymbol}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="size-5" />
          Vault Status
        </CardTitle>
        <CardDescription>
          Monitor and manage the {tokenSymbol} token vault
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-muted p-4">
            <div className="font-medium text-muted-foreground text-sm">
              Current Balance
            </div>
            <div className="font-bold text-lg">
              {formatToken(vaultStatus?.currentBalance)}
            </div>
          </div>
          <div className="rounded-lg bg-muted p-4">
            <div className="font-medium text-muted-foreground text-sm">
              Minimum Reserve
            </div>
            <div className="font-bold text-lg">
              {formatToken(vaultStatus?.minReserve)}
            </div>
          </div>
          <div className="rounded-lg bg-muted p-4">
            <div className="font-medium text-muted-foreground text-sm">
              Available for Claims
            </div>
            <div className="font-bold text-green-600 text-lg dark:text-green-400">
              {formatToken(vaultStatus?.availableForClaims)}
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="deposit">Deposit {tokenSymbol}</Label>
            <div className="flex gap-2">
              <Input
                id="deposit"
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Amount"
                type="number"
                value={depositAmount}
              />
              <Button
                disabled={isDepositing || !depositAmount}
                onClick={handleDeposit}
              >
                <ArrowUpCircle className="size-4" />
                {getDepositButtonText()}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="withdraw">Emergency Withdraw</Label>
            <div className="flex gap-2">
              <Input
                id="withdraw"
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Amount"
                type="number"
                value={withdrawAmount}
              />
              <Button
                disabled={isWithdrawing || !withdrawAmount}
                onClick={handleWithdraw}
                variant="destructive"
              >
                <ArrowDownCircle className="size-4" />
                {isWithdrawing ? "..." : "Withdraw"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
