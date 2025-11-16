"use client";

import {
  useAppKit,
  useAppKitAccount,
  useDisconnect,
} from "@reown/appkit/react";
import type { VariantProps } from "class-variance-authority";
import { Unplug } from "lucide-react";
import { memo, useCallback, useMemo } from "react";
import { useMiniAppContext } from "@/components/providers/miniapp-provider";
import { Button, type buttonVariants } from "@/components/ui/button";
import { useAsyncOperation } from "@/hooks/use-async-operation";
import {
  ERROR_MESSAGES,
  LOADING_MESSAGES,
  SUCCESS_MESSAGES,
} from "@/lib/error-handling";
import { cn } from "@/lib/utils";

type ButtonSize = VariantProps<typeof buttonVariants>["size"];
function ConnectWallet({
  size = "lg" as ButtonSize,
  className,
}: {
  size?: ButtonSize;
  className?: string;
}) {
  const { open } = useAppKit();
  const buttonSize = size === "lg" ? "size-lg" : "size-sm";
  return (
    <div className="mx-auto w-full">
      <Button
        aria-label="Connect wallet"
        className={cn(className, buttonSize)}
        onClick={() => {
          open({ view: "Connect", namespace: "eip155" });
        }}
      >
        Connect Wallet
      </Button>
    </div>
  );
}

const DisconnectWallet = memo(
  ({ onDisconnected }: { onDisconnected?: () => void }) => {
    const { isConnected } = useAppKitAccount({ namespace: "eip155" });
    const { disconnect } = useDisconnect();
    const miniAppContextData = useMiniAppContext();

    const op = useCallback(
      () => disconnect({ namespace: "eip155" }),
      [disconnect]
    );

    const options = useMemo(
      () => ({
        loadingMessage: LOADING_MESSAGES.WALLET_DISCONNECTING,
        successMessage: SUCCESS_MESSAGES.WALLET_DISCONNECTED,
        errorMessage: ERROR_MESSAGES.WALLET_DISCONNECT,
        context: { operation: "wallet-disconnect" },
        onSuccess: onDisconnected,
      }),
      [onDisconnected]
    );

    const { execute: disconnectWallet, isLoading } = useAsyncOperation(
      op,
      options
    );

    const isInMiniApp = Boolean(miniAppContextData?.isInMiniApp);

    return (
      isConnected &&
      !isInMiniApp && (
        <Button
          aria-label="Disconnect wallet"
          className="flex-1"
          disabled={isLoading}
          onClick={disconnectWallet}
          size="sm"
          variant="outline"
        >
          <Unplug className="mr-2 h-4 w-4" /> Disconnect Wallet
        </Button>
      )
    );
  }
);

export { ConnectWallet, DisconnectWallet };
