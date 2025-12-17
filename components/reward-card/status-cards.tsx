"use client";

import { base, celo, optimism } from "@reown/appkit/networks";
import { useAppKitNetwork } from "@reown/appkit/react";
import { type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ERROR_MESSAGES, handleError } from "@/lib/error-handling";
import { cn } from "@/lib/utils";

type StatusCardProps = {
  title: string;
  description: string;
  titleClassName?: string;
  children?: ReactNode;
};

export function StatusCard({
  title,
  description,
  titleClassName,
  children,
}: StatusCardProps) {
  return (
    <Card className="border-border/50">
      <CardContent className="py-12 text-center">
        <div className="space-y-3">
          <h3 className={cn("font-semibold text-xl", titleClassName)}>
            {title}
          </h3>
          <p className="text-muted-foreground text-sm">{description}</p>
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

export function DisconnectedCard() {
  return (
    <StatusCard
      description="Connect your wallet to access daily rewards across all chains"
      title="Connect Wallet"
    />
  );
}

export function DepletedVaultCard() {
  return (
    <StatusCard
      description="The reward vault is currently empty across all chains. Check back soon."
      title="Vault Depleted"
      titleClassName="text-muted-foreground"
    />
  );
}

export function WrongNetworkCard() {
  const { switchNetwork } = useAppKitNetwork();
  const [isSwitching, setIsSwitching] = useState<string | null>(null);

  const handleSwitchNetwork = async (
    network: Parameters<typeof switchNetwork>[0]
  ) => {
    try {
      setIsSwitching(network.name || "chain");
      await switchNetwork(network);
    } catch (error) {
      handleError(error, ERROR_MESSAGES.NETWORK_SWITCH, {
        operation: "wallet/switch-network",
        targetChain: network.name ?? "base",
      });
    } finally {
      setIsSwitching(null);
    }
  };

  return (
    <StatusCard
      description="Daily rewards are available on Base, Celo, and Optimism. Select a network to continue."
      title="Select Network"
    >
      <div className="flex flex-col gap-2">
        <Button
          aria-busy={isSwitching === "Base"}
          className="bg-blue-600 text-white hover:bg-blue-700"
          disabled={isSwitching !== null}
          onClick={() => handleSwitchNetwork(base)}
        >
          {isSwitching === "Base" ? "Switching..." : "Switch to Base"}
        </Button>
        <Button
          aria-busy={isSwitching === "Celo"}
          className="bg-green-600 text-white hover:bg-green-700"
          disabled={isSwitching !== null}
          onClick={() => handleSwitchNetwork(celo)}
        >
          {isSwitching === "Celo" ? "Switching..." : "Switch to Celo"}
        </Button>
        <Button
          aria-busy={isSwitching === "Optimism"}
          className="bg-red-600 text-white hover:bg-red-700"
          disabled={isSwitching !== null}
          onClick={() => handleSwitchNetwork(optimism)}
        >
          {isSwitching === "Optimism" ? "Switching..." : "Switch to Optimism"}
        </Button>
      </div>
    </StatusCard>
  );
}
