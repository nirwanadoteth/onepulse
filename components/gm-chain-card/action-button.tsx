"use client";

import { useAppKitNetwork } from "@reown/appkit/react";
import { memo, type ReactNode, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ConnectWallet } from "@/components/wallet";
import { useAsyncOperation } from "@/hooks/use-async-operation";
import {
  ERROR_MESSAGES,
  LOADING_MESSAGES,
  SUCCESS_MESSAGES,
} from "@/lib/error-handling";
import { networks } from "@/lib/wagmi";

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
    const { switchNetwork } = useAppKitNetwork();
    const targetNetwork = useMemo(
      () => networks.find((net) => net.id === chainId),
      [chainId]
    );

    const op = useCallback(() => {
      if (!targetNetwork) {
        return Promise.reject(new Error(`Network ${chainId} not supported`));
      }
      return switchNetwork(targetNetwork);
    }, [switchNetwork, targetNetwork, chainId]);

    const options = useMemo(
      () => ({
        loadingMessage: LOADING_MESSAGES.NETWORK_SWITCHING,
        successMessage: SUCCESS_MESSAGES.NETWORK_SWITCHED,
        errorMessage: ERROR_MESSAGES.NETWORK_SWITCH,
        context: { operation: "network-switch", chainId },
      }),
      [chainId]
    );

    const { execute: doSwitch, isLoading } = useAsyncOperation(op, options);

    const handleOpenModal = useCallback(() => {
      if (!gmDisabled) {
        onOpenModal();
      }
    }, [gmDisabled, onOpenModal]);

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
