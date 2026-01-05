import { getSlicedAddress } from "@/lib/ens-utils";
import type { UserContext } from "@/types/miniapp";

export type UserInfoProps = {
  user?: UserContext;
  address?: `0x${string}` | string;
};

type AvatarUrlResult = string | undefined;
type MiniAppUserDisplayResult = {
  displayName: string;
  avatarUrl: string | undefined;
  username: string | undefined;
};
type WalletConnectedDisplayResult = {
  avatarUrl: string | undefined;
  displayName: string;
};

export function getAvatarUrl(userPfp: string | undefined): AvatarUrlResult {
  return userPfp || undefined;
}

export function getDisplayName(
  userDisplayName: string | undefined,
  address: `0x${string}`
): string {
  return userDisplayName || getSlicedAddress(address);
}

export function getMiniAppUserDisplay(
  user: UserInfoProps["user"]
): MiniAppUserDisplayResult {
  return {
    displayName: user?.displayName || "Unknown",
    avatarUrl: user?.pfpUrl,
    username: user?.username,
  };
}

export function getWalletConnectedDisplay(
  user: UserInfoProps["user"],
  address: `0x${string}`
): WalletConnectedDisplayResult {
  return {
    avatarUrl: getAvatarUrl(user?.pfpUrl),
    displayName: getDisplayName(user?.displayName, address),
  };
}

export type DisplayState = "hidden" | "miniapp" | "loading" | "wallet";

export function determineDisplayState(
  user: UserInfoProps["user"],
  address: `0x${string}` | undefined
): DisplayState {
  const hasIdentity = Boolean(user || address);
  if (!hasIdentity) {
    return "hidden";
  }
  if (address && !user) {
    return "wallet";
  }
  return "miniapp";
}
