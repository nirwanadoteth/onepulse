import type { GetNameReturnType } from "@coinbase/onchainkit/identity";
import type { Address } from "viem";
import type { UserContext } from "@/components/providers/miniapp-provider";
import { truncateAddress } from "@/lib/ens-utils";

export type UserInfoProps = {
  user?: UserContext;
  address?: Address | string;
};

export const getAvatarUrl = (
  userPfp: string | undefined,
  ensAvatar: string | null | undefined
): string | undefined => userPfp || ensAvatar || undefined;

export const getDisplayName = (
  userDisplayName: string | undefined,
  ensName: GetNameReturnType | undefined,
  address: string | undefined
): string => userDisplayName || ensName || truncateAddress(address);

export const getMiniAppUserDisplay = (user: UserInfoProps["user"]) => ({
  displayName: user?.displayName || "Unknown",
  avatarUrl: user?.pfpUrl || undefined,
  username: user?.username,
});

export const getWalletConnectedDisplay = (
  user: UserInfoProps["user"],
  address: Address,
  ensName: GetNameReturnType | undefined,
  ensAvatar: string | null | undefined
) => ({
  avatarUrl: getAvatarUrl(user?.pfpUrl, ensAvatar),
  displayName: getDisplayName(user?.displayName, ensName, address),
});

export type DisplayState = "hidden" | "miniapp" | "loading" | "wallet";

export const determineDisplayState = (
  user: UserInfoProps["user"],
  address: Address | undefined,
  isLoading: boolean
): DisplayState => {
  const hasIdentity = Boolean(user || address);
  if (!hasIdentity) {
    return "hidden";
  }
  if (isLoading) {
    return "loading";
  }
  if (address && !user) {
    return "wallet";
  }
  return "miniapp";
};
