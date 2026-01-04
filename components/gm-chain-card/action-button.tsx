"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ConnectWallet } from "@/components/wallet";
import type { ChainId } from "@/lib/constants";
import { useActionButtonLogic } from "./use-action-button-logic";

type ActionButtonProps = {
  isConnected: boolean;
  chainId: ChainId;
  name: string;
  onCorrectChain: boolean;
  hasGmToday: boolean;
  gmDisabled: boolean;
  chainBtnClasses: string;
  onOpenModalAction: () => void;
};

export function ActionButton({
  isConnected,
  chainId,
  name,
  onCorrectChain,
  hasGmToday,
  gmDisabled,
  chainBtnClasses,
  onOpenModalAction,
}: ActionButtonProps) {
  const { doSwitch, isLoading, handleOpenModal } = useActionButtonLogic({
    chainId,
    gmDisabled,
    onOpenModal: onOpenModalAction,
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

  return (
    <Button
      className={`w-full ${chainBtnClasses}`}
      disabled={gmDisabled}
      onClick={handleOpenModal}
      size="lg"
    >
      GM on {name}
    </Button>
  );
}
