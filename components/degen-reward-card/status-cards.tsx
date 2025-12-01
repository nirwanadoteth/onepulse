"use client";

import { base } from "@reown/appkit/networks";
import { useAppKitNetwork } from "@reown/appkit/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type StatusCardProps = {
  title: string;
  description: string;
  titleClassName?: string;
};

export function StatusCard({
  title,
  description,
  titleClassName,
}: StatusCardProps) {
  return (
    <Card className="border-border/50">
      <CardContent className="py-12 text-center">
        <div className="space-y-3">
          <h3 className={`font-semibold text-xl ${titleClassName || ""}`}>
            {title}
          </h3>
          <p className="text-muted-foreground text-sm">{description}</p>
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

  const handleSwitchToBase = () => {
    switchNetwork(base);
  };

  return (
    <Card className="border-border/50">
      <CardContent className="py-12 text-center">
        <div className="space-y-4">
          <h3 className="font-semibold text-xl">Switch to Base</h3>
          <p className="text-muted-foreground text-sm">
            DEGEN rewards are only available on Base network
          </p>
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleSwitchToBase}
          >
            Switch to Base
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
