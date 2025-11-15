"use client";

import {
  type GetNameReturnType,
  useAvatar,
  useName,
} from "@coinbase/onchainkit/identity";
import { useAppKitAccount, useDisconnect } from "@reown/appkit/react";
import { memo, type ReactNode } from "react";
import type { Address } from "viem";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAsyncOperation } from "@/hooks/use-async-operation";
import { truncateAddress } from "@/lib/ens-utils";
import {
  ERROR_MESSAGES,
  LOADING_MESSAGES,
  SUCCESS_MESSAGES,
} from "@/lib/error-handling";

import type { UserContext } from "./providers/miniapp-provider";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

type UserInfoProps = {
  user?: UserContext;
  address?: Address | string;
};

const getAvatarUrl = (
  userPfp: string | undefined,
  ensAvatar: string | null | undefined
): string | undefined => userPfp || ensAvatar || undefined;

const getDisplayName = (
  userDisplayName: string | undefined,
  ensName: GetNameReturnType | undefined,
  address: string
): string => userDisplayName || ensName || truncateAddress(address);

const UserAvatar = memo(
  ({
    url: avatarUrl,
    name: displayName,
    isConnected,
  }: {
    url: string | undefined;
    name: string;
    isConnected: boolean;
  }) => {
    const { disconnect } = useDisconnect();
    const { execute: disconnectWallet, isLoading } = useAsyncOperation(
      () => disconnect({ namespace: "eip155" }),
      {
        loadingMessage: LOADING_MESSAGES.WALLET_DISCONNECTING,
        successMessage: SUCCESS_MESSAGES.WALLET_DISCONNECTED,
        errorMessage: ERROR_MESSAGES.WALLET_DISCONNECT,
        context: { operation: "dropdown-disconnect" },
      }
    );

    if (!isConnected) {
      return (
        <Avatar className="size-8">
          <AvatarImage alt={displayName} src={avatarUrl} />
          <AvatarFallback className="text-xs">
            {displayName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="rounded-full p-0" size="icon" variant="outline">
            <Avatar className="size-8">
              <AvatarImage alt={displayName} src={avatarUrl} />
              <AvatarFallback className="text-xs">
                {displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-40">
          <DropdownMenuItem
            disabled={isLoading}
            inset
            onSelect={() => {
              disconnectWallet();
            }}
            variant="destructive"
          >
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
);

const UserData = memo(
  ({
    displayName,
    username,
    address,
  }: {
    displayName: string;
    username?: string;
    address?: string;
  }) => {
    const showUsername = username && address === undefined;
    return (
      <div className="flex flex-col gap-1 text-sm leading-none">
        <span className="font-medium">{displayName}</span>
        {showUsername ? (
          <span className="text-muted-foreground">@{username}</span>
        ) : (
          <span className="text-muted-foreground">
            {truncateAddress(address)}
          </span>
        )}
      </div>
    );
  }
);

const UserInfoSkeleton = memo(() => (
  <div className="flex flex-col gap-1">
    <Skeleton className="h-3.5 w-20 rounded" />
    <Skeleton className="h-3.5 w-16 rounded" />
  </div>
));

const getMiniAppUserDisplay = (user: UserInfoProps["user"]) => ({
  displayName: user?.displayName || "Unknown",
  avatarUrl: user?.pfpUrl || undefined,
  username: user?.username,
});

const getWalletConnectedDisplay = (
  user: UserInfoProps["user"],
  address: Address,
  ensName: GetNameReturnType | undefined,
  ensAvatar: string | null | undefined
) => ({
  avatarUrl: getAvatarUrl(user?.pfpUrl, ensAvatar),
  displayName: getDisplayName(user?.displayName, ensName, address),
});

const renderMiniAppUser = (
  user: UserInfoProps["user"],
  isConnected: boolean
) => {
  const { displayName, avatarUrl, username } = getMiniAppUserDisplay(user);
  return (
    <div className="flex items-center gap-2">
      <UserAvatar
        isConnected={isConnected}
        name={displayName}
        url={avatarUrl}
      />
      <UserData displayName={displayName} username={username} />
    </div>
  );
};

const renderWalletLoading = () => (
  <div className="flex items-center gap-2">
    <Skeleton className="size-8 rounded-full" />
    <UserInfoSkeleton />
  </div>
);

const renderWalletConnected = (params: {
  user: UserInfoProps["user"];
  address: Address;
  ensName: GetNameReturnType | undefined;
  ensAvatar: string | null | undefined;
  isConnected: boolean;
}) => {
  const { avatarUrl, displayName } = getWalletConnectedDisplay(
    params.user,
    params.address,
    params.ensName,
    params.ensAvatar
  );

  return (
    <div className="flex items-center gap-2">
      <UserAvatar
        isConnected={params.isConnected}
        name={displayName}
        url={avatarUrl}
      />
      <UserData address={params.address} displayName={displayName} />
    </div>
  );
};

type DisplayState = "hidden" | "miniapp" | "loading" | "wallet";

const determineDisplayState = (
  user: UserInfoProps["user"],
  address: Address | undefined,
  isLoading: boolean
): DisplayState => {
  if (!(user || address)) {
    return "hidden";
  }
  if ((address || user) && isLoading) {
    return "loading";
  }
  if (address && !user) {
    return "wallet";
  }
  return "miniapp";
};

const renderByState = (params: {
  state: DisplayState;
  user: UserInfoProps["user"];
  address: Address;
  ensName: GetNameReturnType | undefined;
  ensAvatar: string | null | undefined;
  isConnected: boolean;
}): ReactNode => {
  if (params.state === "hidden") {
    return null;
  }
  if (params.state === "miniapp") {
    return renderMiniAppUser(params.user, params.isConnected);
  }
  if (params.state === "loading") {
    return renderWalletLoading();
  }
  return renderWalletConnected({
    user: params.user,
    address: params.address,
    ensName: params.ensName,
    ensAvatar: params.ensAvatar,
    isConnected: params.isConnected,
  });
};

export const UserInfo = memo(
  ({ user, address: addressProp }: UserInfoProps) => {
    const { address: connectedAddress, isConnected } = useAppKitAccount({
      namespace: "eip155",
    });
    const address = (addressProp || connectedAddress) as Address;

    const { data: ensName, isLoading: isNameLoading } = useName({ address });
    const { data: ensAvatar, isLoading: isAvatarLoading } = useAvatar({
      ensName: ensName || "",
    });

    const isLoading = isNameLoading || isAvatarLoading;
    const state = determineDisplayState(user, address, isLoading);

    return renderByState({
      state,
      user,
      address,
      ensName,
      ensAvatar,
      isConnected,
    });
  }
);
