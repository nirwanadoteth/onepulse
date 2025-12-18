"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Address } from "viem";
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

type BlacklistManagementCardProps = {
  contractAddress: Address;
  onRefetchAction: () => void;
};

export function BlacklistManagementCard({
  contractAddress,
  onRefetchAction,
}: BlacklistManagementCardProps) {
  const [fids, setFids] = useState("");

  const { writeContract, isPending, data: hash } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isSuccess) {
      toast.success("Transaction confirmed!");
      onRefetchAction();
    }
  }, [isSuccess, onRefetchAction]);

  const handleUpdateBlacklist = (blacklist: boolean) => {
    if (!fids) {
      return;
    }

    try {
      const fidArray = fids
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s)
        .map((s) => BigInt(s));

      if (fidArray.length === 0) {
        toast.error("No valid FIDs entered");
        return;
      }

      writeContract(
        {
          address: contractAddress,
          abi: dailyRewardsV2Abi,
          functionName: "updateBlacklist",
          args: [fidArray, blacklist],
        },
        {
          onSuccess: () => {
            toast.info("Transaction submitted...");
            setFids("");
          },
          onError: (error) => {
            toast.error(`Error: ${error.message}`);
          },
        }
      );
    } catch (_error) {
      toast.error("Invalid FID format");
    }
  };

  const isLoading = isPending || isConfirming;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Blacklist Management</CardTitle>
        <CardDescription>
          Block or unblock FIDs from claiming rewards
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Farcaster IDs (comma separated)</Label>
          <Input
            disabled={isLoading}
            onChange={(e) => setFids(e.target.value)}
            placeholder="123, 456, 789"
            value={fids}
          />
        </div>
        <div className="flex gap-2">
          <Button
            disabled={isLoading || !fids}
            onClick={() => handleUpdateBlacklist(true)}
            variant="destructive"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Blacklist FIDs"
            )}
          </Button>
          <Button
            disabled={isLoading || !fids}
            onClick={() => handleUpdateBlacklist(false)}
            variant="outline"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Remove from Blacklist"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
