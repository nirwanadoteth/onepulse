"use client";

import { base } from "@reown/appkit/networks";
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
      description="Connect your wallet to access daily DEGEN rewards"
      title="Connect Wallet"
    />
  );
}

export function DepletedVaultCard() {
  return (
    <StatusCard
      description="The reward vault is currently empty. Check back soon."
      title="Vault Depleted"
      titleClassName="text-muted-foreground"
    />
  );
}

export function WrongNetworkCard() {
  const { switchNetwork } = useAppKitNetwork();
  const [isSwitching, setIsSwitching] = useState(false);

  const handleSwitchToBase = async () => {
    try {
      setIsSwitching(true);
      await switchNetwork(base);
    } catch (error) {
      handleError(error, ERROR_MESSAGES.NETWORK_SWITCH, {
        operation: "wallet/switch-network",
        targetChain: "base",
      });
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <StatusCard
      description="DEGEN rewards are only available on Base network"
      title="Switch to Base"
    >
      <Button
        aria-busy={isSwitching}
        className="bg-blue-600 text-white hover:bg-blue-700"
        disabled={isSwitching}
        onClick={handleSwitchToBase}
      >
        {isSwitching ? "Switching..." : "Switch to Base"}
      </Button>
    </StatusCard>
  );
}
