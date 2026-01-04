"use client";

import type { Address } from "viem/accounts";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ConnectWallet } from "@/components/wallet";
import type { ChainId } from "@/lib/constants";
import { GMTransaction } from "./gm-transaction";
import { useActionButtonLogic } from "./use-action-button-logic";

type ActionButtonProps = {
  isConnected: boolean;
  chainId: ChainId;
  name: string;
  onCorrectChain: boolean;
  hasGmToday: boolean;
  gmDisabled: boolean;
  chainBtnClasses: string;
  contractAddress: Address;
  isSponsored: boolean;
  processing: boolean;
  address?: `0x${string}`;
  refetchLastGmDayAction?: () => Promise<unknown>;
  setProcessingAction: (value: boolean) => void;
};

export function ActionButton({
  isConnected,
  chainId,
  name,
  onCorrectChain,
  hasGmToday,
  gmDisabled,
  chainBtnClasses,
  contractAddress,
  isSponsored,
  processing,
  address,
  refetchLastGmDayAction,
  setProcessingAction,
}: ActionButtonProps) {
  const { doSwitch, isLoading } = useActionButtonLogic({
    chainId,
    gmDisabled,
  });

  if (!isConnected) {
    return <ConnectWallet className={`${chainBtnClasses}`} />;
  }

  if (hasGmToday) {
    return (
      <Button className={`w-full ${chainBtnClasses}`} disabled size="lg">
        Already GM'd
      </Button>
    );
  }

  if (!onCorrectChain) {
    return (
      <Button
        aria-busy={isLoading}
        className={`w-full ${chainBtnClasses}`}
        disabled={isLoading}
        onClick={() => doSwitch}
        size="lg"
      >
        {isLoading ? (
          <>
            <Spinner /> Switching…
          </>
        ) : (
          `Switch to ${name}`
        )}
      </Button>
    );
  }

  if (!address) {
    return null;
  }

  return (
    <GMTransaction
      address={address}
      buttonLabel={`GM on ${name}`}
      chainBtnClasses={chainBtnClasses}
      chainId={chainId}
      contractAddress={contractAddress}
      isContractReady={!gmDisabled}
      isSponsored={isSponsored}
      onCloseAction={() => undefined}
      processing={processing}
      refetchLastGmDayAction={refetchLastGmDayAction}
      setProcessingAction={setProcessingAction}
    />
  );
}
