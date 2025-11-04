"use client"

import React from "react"
import {
  useAvatar,
  useName,
  type GetNameReturnType,
} from "@coinbase/onchainkit/identity"
import type { Address } from "viem"
import { useAccount } from "wagmi"

import { truncateAddress } from "@/lib/ens-utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"

interface HeaderUserInfoProps {
  user?: {
    fid: number
    displayName?: string
    username?: string
    pfpUrl?: string
  }
  address?: Address | string
}

// Determine which avatar to display
const getAvatarUrl = (
  userPfp: string | undefined,
  ensAvatar: string | null | undefined
): string | undefined => userPfp || ensAvatar || undefined

// Determine which name to display
const getDisplayName = (
  userDisplayName: string | undefined,
  ensName: GetNameReturnType | undefined,
  address: string
): string => userDisplayName || ensName || truncateAddress(address)

// Subcomponent for avatar display
const UserAvatar = React.memo(function UserAvatar({
  url: avatarUrl,
  name: displayName,
}: {
  url: string | undefined
  name: string
}) {
  return (
    <Avatar className="size-8">
      <AvatarImage src={avatarUrl} alt={displayName} />
      <AvatarFallback className="text-xs">
        {displayName.slice(0, 2).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  )
})

// Subcomponent for user info text
const UserInfo = React.memo(function UserInfo({
  displayName,
  username,
  address,
}: {
  displayName: string
  username?: string
  address?: string
}) {
  const showUsername = username && address === undefined
  return (
    <div className="flex flex-col">
      <span className="text-sm leading-none font-medium">{displayName}</span>
      {showUsername ? (
        <span className="text-muted-foreground text-xs">@{username}</span>
      ) : (
        <span className="text-muted-foreground text-xs">
          {truncateAddress(address)}
        </span>
      )}
    </div>
  )
})

// Skeleton loader for user info
const UserInfoSkeleton = React.memo(function UserInfoSkeleton() {
  return (
    <div className="flex flex-col gap-1">
      <Skeleton className="h-4 w-20 rounded" />
      <Skeleton className="h-3 w-16 rounded" />
    </div>
  )
})

// Extract display data for MiniApp user without wallet
const getMiniAppUserDisplay = (user: HeaderUserInfoProps["user"]) => ({
  displayName: user?.displayName || "Unknown",
  avatarUrl: user?.pfpUrl || undefined,
  username: user?.username,
})

// Extract display data for wallet connected user with ENS resolution
const getWalletConnectedDisplay = (
  user: HeaderUserInfoProps["user"],
  address: Address,
  ensName: GetNameReturnType | undefined,
  ensAvatar: string | null | undefined
) => ({
  avatarUrl: getAvatarUrl(user?.pfpUrl, ensAvatar),
  displayName: getDisplayName(user?.displayName, ensName, address),
})

// Render MiniApp user (no wallet connected)
const renderMiniAppUser = (user: HeaderUserInfoProps["user"]) => {
  const { displayName, avatarUrl, username } = getMiniAppUserDisplay(user)
  return (
    <div className="flex items-center gap-2">
      <UserAvatar url={avatarUrl} name={displayName} />
      <UserInfo displayName={displayName} username={username} />
    </div>
  )
}

// Render wallet loading state
const renderWalletLoading = () => (
  <div className="flex items-center gap-2">
    <Skeleton className="size-8 rounded-full" />
    <UserInfoSkeleton />
  </div>
)

// Render wallet connected with resolved data
const renderWalletConnected = (
  user: HeaderUserInfoProps["user"],
  address: Address,
  ensName: GetNameReturnType | undefined,
  ensAvatar: string | null | undefined
) => {
  const { avatarUrl, displayName } = getWalletConnectedDisplay(
    user,
    address,
    ensName,
    ensAvatar
  )

  return (
    <div className="flex items-center gap-2">
      <UserAvatar url={avatarUrl} name={displayName} />
      <UserInfo displayName={displayName} address={address} />
    </div>
  )
}

// Determine component display state
type DisplayState = "hidden" | "miniapp" | "loading" | "wallet"

const determineDisplayState = (
  user: HeaderUserInfoProps["user"],
  address: Address | undefined,
  isLoading: boolean
): DisplayState => {
  if (!user && !address) return "hidden"
  if ((address || user) && isLoading) return "loading"
  if (address && !user) return "wallet"
  return "miniapp"
}

// Map state to renderer
const renderByState = (
  state: DisplayState,
  user: HeaderUserInfoProps["user"],
  address: Address | undefined,
  ensName: GetNameReturnType | undefined,
  ensAvatar: string | null | undefined
): React.ReactNode => {
  if (state === "hidden") return null
  if (state === "miniapp") return renderMiniAppUser(user)
  if (state === "loading") return renderWalletLoading()
  return renderWalletConnected(user, address!, ensName, ensAvatar)
}

export const HeaderUserInfo = React.memo(function HeaderUserInfo({
  user,
  address: addressProp,
}: HeaderUserInfoProps) {
  const { address: connectedAddress } = useAccount()
  const address = (addressProp || connectedAddress) as Address | undefined

  const { data: ensName, isLoading: isNameLoading } = useName({ address })
  const { data: ensAvatar, isLoading: isAvatarLoading } = useAvatar({
    ensName: ensName || "",
  })

  const isLoading = isNameLoading || isAvatarLoading
  const state = determineDisplayState(user, address, isLoading)

  return renderByState(state, user, address, ensName, ensAvatar)
})
