"use client";

import React, { useCallback } from "react";
import { useSwitchChain } from "wagmi";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ConnectWallet } from "@/components/wallet";

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
  renderCountdown: (targetSec: number) => React.ReactNode;
};

export const ActionButton = React.memo(
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
    const { switchChain, isPending: isSwitching } = useSwitchChain();

    const handleSwitchChain = useCallback(() => {
      try {
        switchChain({
          chainId: chainId as 10 | 8453 | 42220,
        });
      } catch (e) {
        console.error("Failed to switch chain", e);
      }
    }, [switchChain, chainId]);

    const handleOpenModal = useCallback(() => {
      if (!gmDisabled) {
        onOpenModal();
      }
    }, [gmDisabled, onOpenModal]); // ✓ Dependencies are stable and necessary

    // User not connected
    if (!isConnected) {
      return (
        <ConnectWallet className={`w-full ${chainBtnClasses}`} size="lg" />
      );
    }

    // User on wrong chain
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
          aria-busy={isSwitching}
          className={`w-full ${chainBtnClasses}`}
          disabled={isSwitching}
          onClick={handleSwitchChain}
          size="lg"
        >
          {isSwitching ? (
            <>
              <Spinner /> Switching…
            </>
          ) : (
            `Switch to ${name}`
          )}
        </Button>
      );
    }

    // User on correct chain - show main action
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
