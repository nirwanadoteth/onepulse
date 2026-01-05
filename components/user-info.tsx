"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useUserInfoLogic } from "./user-info/use-user-info-logic";
import { UserAvatar } from "./user-info/user-avatar";
import { UserData } from "./user-info/user-data";
import { UserInfoSkeleton } from "./user-info/user-info-skeleton";
import {
  getMiniAppUserDisplay,
  getWalletConnectedDisplay,
  type UserInfoProps,
} from "./user-info/utils";

const MiniAppUserView = ({
  user,
  isConnected,
}: {
  user: UserInfoProps["user"];
  isConnected: boolean;
}) => {
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

const WalletLoadingView = () => (
  <div className="flex items-center gap-2">
    <Skeleton className="size-8 rounded-full" />
    <UserInfoSkeleton />
  </div>
);

const WalletConnectedView = ({
  user,
  address,
  isConnected,
}: {
  user: UserInfoProps["user"];
  address: `0x${string}`;
  isConnected: boolean;
}) => {
  const { avatarUrl, displayName } = getWalletConnectedDisplay(user, address);

  return (
    <div className="flex items-center gap-2">
      <UserAvatar
        isConnected={isConnected}
        name={displayName}
        url={avatarUrl}
      />
      <UserData address={address} displayName={displayName} />
    </div>
  );
};

export function UserInfo({ user, address: addressProp }: UserInfoProps) {
  const { address, isConnected, state } = useUserInfoLogic({
    user,
    address: addressProp,
  });

  if (state === "hidden") {
    return null;
  }

  if (state === "miniapp") {
    return <MiniAppUserView isConnected={isConnected} user={user} />;
  }

  if (state === "loading") {
    return <WalletLoadingView />;
  }

  return (
    <WalletConnectedView
      address={address}
      isConnected={isConnected}
      user={user}
    />
  );
}
