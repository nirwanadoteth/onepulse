"use client";

import { memo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ConnectWallet } from "@/components/wallet";
import { useActionButtonLogic } from "./use-action-button-logic";

type ActionButtonProps = {
  isConnected: boolean;
  chainId: number;
  name: string;
  onCorrectChain: boolean;
  hasGmToday: boolean;
  gmDisabled: boolean;
  targetSec: number;
  chainBtnClasses: string;
  onOpenModal: () => void;
  renderCountdown: (targetSec: number) => ReactNode;
};

export const ActionButton = memo(
  ({
    isConnected,
    chainId,
    name,
    onCorrectChain,
    hasGmToday,
    gmDisabled,
    targetSec,
    chainBtnClasses,
    onOpenModal,
    renderCountdown,
  }: ActionButtonProps) => {
    const { doSwitch, isLoading, handleOpenModal } = useActionButtonLogic({
      chainId,
      gmDisabled,
      onOpenModal,
    });

    if (!isConnected) {
      return (
        <ConnectWallet className={`w-full ${chainBtnClasses}`} size="lg" />
      );
    }

    if (!onCorrectChain) {
      if (hasGmToday) {
        return (
          <Button className={`w-full ${chainBtnClasses}`} disabled size="lg">
            {renderCountdown(targetSec)}
          </Button>
        );
      }

      return (
        <Button
          aria-busy={isLoading}
          className={`w-full ${chainBtnClasses}`}
          disabled={isLoading}
          onClick={doSwitch}
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
        {hasGmToday ? renderCountdown(targetSec) : `GM on ${name}`}
      </Button>
    );
  }
);
ActionButton.displayName = "ActionButton";
