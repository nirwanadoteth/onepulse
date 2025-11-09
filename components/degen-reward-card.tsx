"use client";

import React from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { base } from "wagmi/chains";
import { DegenClaimTransaction } from "@/components/gm-chain-card/degen-claim-transaction";
import { ShareGMStatus } from "@/components/share-gm-status";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  useClaimEligibility,
  useRewardVaultStatus,
} from "@/hooks/use-degen-claim";

type DegenRewardCardProps = {
  fid: bigint | undefined;
  sponsored: boolean;
};

type ClaimState = {
  isEligible: boolean;
  hasAlreadyClaimed: boolean;
  isFidBlacklisted: boolean;
  hasSentGMToday: boolean;
  reward: bigint;
};

type ClaimEligibility = {
  ok: boolean;
  fidIsBlacklisted: boolean;
  fidClaimedToday: boolean;
  claimerClaimedToday: boolean;
  reward: bigint;
  vaultBalance: bigint;
  minReserve: bigint;
};

function extractClaimState(
  claimStatus: ClaimEligibility | undefined,
  hasSentGMToday: boolean
): ClaimState {
  return {
    isEligible: claimStatus?.ok ?? false,
    hasAlreadyClaimed: claimStatus?.claimerClaimedToday ?? false,
    isFidBlacklisted: claimStatus?.fidIsBlacklisted ?? false,
    hasSentGMToday,
    reward: claimStatus?.reward ?? 0n,
  };
}

function getStatusConfig(state: ClaimState) {
  if (state.isFidBlacklisted) {
    return {
      title: "Access Restricted",
      description: "FID is blacklisted from claiming rewards",
      accentColor: "text-red-600 dark:text-red-400",
    };
  }
  if (state.hasAlreadyClaimed) {
    return {
      title: "Claimed Today",
      description: "You've already claimed your daily rewards",
      accentColor: "text-green-600 dark:text-green-400",
    };
  }
  if (!state.hasSentGMToday) {
    return {
      title: "Send GM First",
      description: "Send a GM on Base to become eligible for rewards",
      accentColor: "text-blue-600 dark:text-blue-400",
    };
  }
  if (state.isEligible) {
    return {
      title: "Ready to Claim",
      description: "Your daily DEGEN rewards are available",
      accentColor: "text-yellow-600 dark:text-yellow-400",
    };
  }
  return {
    title: "Not Eligible",
    description: "Complete requirements to claim rewards",
    accentColor: "text-muted-foreground",
  };
}

type RewardCardProps = {
  fid: bigint | undefined;
  sponsored: boolean;
  state: ClaimState;
  isCheckingEligibility: boolean;
  hasClaimedToday: boolean;
  onClaimSuccess: () => void;
};

function RewardCard({
  fid,
  sponsored,
  state,
  isCheckingEligibility,
  hasClaimedToday,
  onClaimSuccess,
}: RewardCardProps) {
  const config = getStatusConfig(state);

  return (
    <Card className="border-border/50">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className={`font-semibold text-xl ${config.accentColor}`}>
              {config.title}
            </h3>
            <p className="text-muted-foreground text-sm">
              {config.description}
            </p>
          </div>
          {!isCheckingEligibility && state.reward > 0n && (
            <div className="text-right">
              <div className="font-light text-3xl tracking-tight">
                {(Number(state.reward) / 1e18).toFixed(0)}
              </div>
              <div className="text-muted-foreground text-xs uppercase tracking-wider">
                DEGEN
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <DegenClaimTransaction
          disabled={!state.isEligible}
          fid={fid}
          onSuccess={onClaimSuccess}
          sponsored={sponsored}
        />

        {hasClaimedToday && (
          <div className="mt-4">
            <ShareGMStatus claimedToday={true} className="justify-center" />
          </div>
        )}

        {isCheckingEligibility && (
          <div className="mt-4 flex items-center gap-2 text-muted-foreground text-xs">
            <div className="h-3 w-3 animate-spin rounded-full border border-primary border-t-transparent" />
            Checking eligibility
          </div>
        )}
      </CardContent>
    </Card>
  );
}

type StatusCardProps = {
  title: string;
  description: string;
  titleClassName?: string;
};

function StatusCard({ title, description, titleClassName }: StatusCardProps) {
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

function DisconnectedCard() {
  return (
    <StatusCard
      description="Connect your wallet to access daily DEGEN rewards"
      title="Connect Wallet"
    />
  );
}

function DepletedVaultCard() {
  return (
    <StatusCard
      description="The reward vault is currently empty. Check back soon."
      title="Vault Depleted"
      titleClassName="text-muted-foreground"
    />
  );
}

function WrongNetworkCard() {
  const { switchChain } = useSwitchChain();

  const handleSwitchToBase = () => {
    switchChain({ chainId: base.id });
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

export const DegenRewardCard = React.memo(
  ({ fid, sponsored }: DegenRewardCardProps) => {
    const [hasClaimedToday, setHasClaimedToday] = React.useState(false);
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const {
      claimStatus,
      hasSentGMToday,
      isPending: isCheckingEligibility,
    } = useClaimEligibility({
      fid,
      enabled: isConnected,
    });
    const { hasRewards } = useRewardVaultStatus();

    if (!(isConnected && address)) {
      return <DisconnectedCard />;
    }

    if (chainId !== base.id) {
      return <WrongNetworkCard />;
    }

    if (!hasRewards) {
      return <DepletedVaultCard />;
    }

    const claimState = extractClaimState(claimStatus, hasSentGMToday);
    return (
      <RewardCard
        fid={fid}
        hasClaimedToday={hasClaimedToday}
        isCheckingEligibility={isCheckingEligibility}
        onClaimSuccess={() => setHasClaimedToday(true)}
        sponsored={sponsored}
        state={claimState}
      />
    );
  }
);
