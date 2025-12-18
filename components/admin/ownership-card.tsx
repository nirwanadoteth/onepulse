"use client";

import { Crown, Loader2, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { type Address, isAddress } from "viem";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
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
import { dailyRewardsV2Abi } from "@/lib/abi/daily-rewards-v2";

type OwnershipCardProps = {
  contractAddress: Address;
  owner: Address | undefined;
  pendingOwner: Address | undefined;
  onRefetchAction: () => void;
};

export function OwnershipCard({
  contractAddress,
  owner,
  pendingOwner,
  onRefetchAction,
}: OwnershipCardProps) {
  const { address } = useAccount();
  const [newOwnerAddress, setNewOwnerAddress] = useState("");
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const { writeContract, isPending, data: hash } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isSuccess) {
      toast.success("Transaction confirmed!");
      onRefetchAction();
      setNewOwnerAddress("");
      setPendingAction(null);
      setShowConfirmDialog(false);
    }
  }, [isSuccess, onRefetchAction]);

  const validateAddress = (value: string): string | undefined => {
    if (!value) {
      return "Address is required";
    }
    return isAddress(value as Address) ? undefined : "Invalid Ethereum address";
  };

  const handleTransferOwnership = () => {
    const error = validateAddress(newOwnerAddress);
    if (error) {
      toast.error(error);
      return;
    }

    if (newOwnerAddress.toLowerCase() === owner?.toLowerCase()) {
      toast.error("New owner cannot be the same as current owner");
      return;
    }

    setPendingAction("transferOwnership");
    setShowConfirmDialog(true);
  };

  const handleAcceptOwnership = () => {
    if (
      !pendingOwner ||
      address?.toLowerCase() !== pendingOwner.toLowerCase()
    ) {
      toast.error("You are not the pending owner");
      return;
    }

    setPendingAction("acceptOwnership");
    setShowConfirmDialog(true);
  };

  const confirmAndExecute = () => {
    if (pendingAction === "transferOwnership") {
      writeContract(
        {
          address: contractAddress,
          abi: dailyRewardsV2Abi,
          functionName: "transferOwnership",
          args: [newOwnerAddress as Address],
        },
        {
          onSuccess: () => {
            toast.info("Ownership transfer initiated...");
          },
          onError: (error) => {
            toast.error(`Error: ${error.message}`);
            setPendingAction(null);
            setShowConfirmDialog(false);
          },
        }
      );
    } else if (pendingAction === "acceptOwnership") {
      writeContract(
        {
          address: contractAddress,
          abi: dailyRewardsV2Abi,
          functionName: "acceptOwnership",
        },
        {
          onSuccess: () => {
            toast.info("Accepting ownership...");
          },
          onError: (error) => {
            toast.error(`Error: ${error.message}`);
            setPendingAction(null);
            setShowConfirmDialog(false);
          },
        }
      );
    }
  };

  const isLoading = isPending || isConfirming;
  const isCurrentOwner = address?.toLowerCase() === owner?.toLowerCase();
  const isPendingOwner = address?.toLowerCase() === pendingOwner?.toLowerCase();

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="size-5" />
            Contract Ownership
          </CardTitle>
          <CardDescription>
            Transfer or accept ownership of the contract
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Current Owner</Label>
            <div className="break-all rounded-lg bg-muted p-3 font-mono text-sm">
              {owner || "Loading..."}
            </div>
          </div>

          {pendingOwner &&
            pendingOwner !== "0x0000000000000000000000000000000000000000" && (
              <div className="space-y-2">
                <Label>Pending Owner</Label>
                <div className="break-all rounded-lg border border-yellow-200 bg-yellow-50 p-3 font-mono text-sm dark:border-yellow-800 dark:bg-yellow-950/20">
                  {pendingOwner}
                  {isPendingOwner && (
                    <div className="mt-2">
                      <Button
                        disabled={isLoading}
                        onClick={handleAcceptOwnership}
                        size="sm"
                        variant="outline"
                      >
                        <UserCheck className="mr-2 size-4" />
                        Accept Ownership
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

          {isCurrentOwner && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newOwner">Transfer Ownership To</Label>
                <Input
                  disabled={isLoading}
                  id="newOwner"
                  onChange={(e) => setNewOwnerAddress(e.target.value)}
                  placeholder="0x..."
                  value={newOwnerAddress}
                />
              </div>
              <Button
                disabled={isLoading || !newOwnerAddress}
                onClick={handleTransferOwnership}
                variant="outline"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  "Transfer Ownership"
                )}
              </Button>
            </div>
          )}

          {!(isCurrentOwner || isPendingOwner) && (
            <div className="rounded-lg bg-muted p-4 text-center text-muted-foreground">
              Connect with the contract owner to manage ownership
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog onOpenChange={setShowConfirmDialog} open={showConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction === "transferOwnership"
                ? `Are you sure you want to transfer ownership to ${newOwnerAddress}? The new owner will need to accept the transfer.`
                : "Are you sure you want to accept ownership of this contract?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={isLoading} onClick={confirmAndExecute}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
