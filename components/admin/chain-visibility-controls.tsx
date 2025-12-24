"use client";

import { useAppKitAccount } from "@reown/appkit/react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  useHiddenChains,
  useToggleChainVisibility,
} from "@/hooks/use-hidden-chains";
import {
  BASE_CHAIN_ID,
  CELO_CHAIN_ID,
  OPTIMISM_CHAIN_ID,
} from "@/lib/constants";

const ALL_CHAINS = [
  { id: BASE_CHAIN_ID, name: "Base" },
  { id: CELO_CHAIN_ID, name: "Celo" },
  { id: OPTIMISM_CHAIN_ID, name: "Optimism" },
];

export function ChainVisibilityControls() {
  const { address } = useAppKitAccount({ namespace: "eip155" });
  const { data: hiddenChains = [], isLoading } = useHiddenChains();
  const toggleVisibility = useToggleChainVisibility();
  const queryClient = useQueryClient();
  const [togglingChain, setTogglingChain] = useState<number | null>(null);

  const handleToggle = async (chainId: number, chainName: string) => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    setTogglingChain(chainId);
    try {
      await toggleVisibility(chainId, address);
      await queryClient.invalidateQueries({ queryKey: ["hidden-chains"] });

      const isHidden = hiddenChains.includes(chainId);
      toast.success(
        `${chainName} rewards ${isHidden ? "shown" : "hidden"} successfully`
      );
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to toggle chain visibility");
      }
    } finally {
      setTogglingChain(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Chain Visibility</h3>
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-lg">Chain Visibility</h3>
        <p className="text-muted-foreground text-sm">
          Control which chains are visible in the rewards section
        </p>
      </div>

      <div className="space-y-2">
        {ALL_CHAINS.map((chain) => {
          const isHidden = hiddenChains.includes(chain.id);
          const isToggling = togglingChain === chain.id;

          let buttonContent: React.ReactNode;
          if (isToggling) {
            buttonContent = (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            );
          } else if (isHidden) {
            buttonContent = (
              <>
                <Icons.eye className="mr-2 h-4 w-4" />
                Show
              </>
            );
          } else {
            buttonContent = (
              <>
                <Icons.eyeOff className="mr-2 h-4 w-4" />
                Hide
              </>
            );
          }

          return (
            <div
              className="flex items-center justify-between rounded-lg border p-4"
              key={chain.id}
            >
              <div className="flex items-center gap-3">
                <div className={`${isHidden ? "opacity-50" : ""}`}>
                  <span className="font-medium">{chain.name}</span>
                  <span className="ml-2 text-muted-foreground text-sm">
                    Chain ID: {chain.id}
                  </span>
                </div>
                {isHidden && (
                  <span className="rounded-full bg-yellow-500/10 px-2 py-1 font-medium text-xs text-yellow-600 dark:text-yellow-500">
                    Hidden
                  </span>
                )}
              </div>

              <Button
                disabled={isToggling}
                onClick={() => handleToggle(chain.id, chain.name)}
                size="sm"
                variant={isHidden ? "default" : "destructive"}
              >
                {buttonContent}
              </Button>
            </div>
          );
        })}
      </div>

      <p className="text-muted-foreground text-xs">
        Hidden chains will not appear in the rewards section for any users.
      </p>
    </div>
  );
}
