"use client"

import { useMiniKit } from "@coinbase/onchainkit/minikit"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GMBase } from "@/components/gm-base"
import { Profile } from "@/components/profile"

interface HomeTabsProps {
  tab: string
  onTabChange: (tab: string) => void
  isSmartWallet: boolean
  onProfileDisconnected: () => void
}

export function HomeTabs({
  tab,
  onTabChange,
  isSmartWallet,
  onProfileDisconnected,
}: HomeTabsProps) {
  const { context } = useMiniKit()
  const isBaseApp = context?.client?.clientFid === 309857
  const isFarcaster = context?.client?.clientFid === 1

  const allowedChainIds = isFarcaster
    ? [8453, 42220, 10]
    : isBaseApp
      ? [8453, 10]
      : [8453, 42220, 10]

  const user = context?.user
    ? {
        fid: context.user.fid,
        displayName: context.user.displayName ?? "",
        username: context.user.username ?? "",
        pfpUrl: context.user.pfpUrl,
      }
    : undefined

  return (
    <div className="mt-4 mb-6">
      <Tabs value={tab} onValueChange={onTabChange}>
        <TabsList className="bg-background border-border flex h-12 w-full gap-2 rounded-lg border">
          <TabsTrigger value="home" className="data-[state=active]:bg-accent">
            Home
          </TabsTrigger>
          <TabsTrigger
            value="profile"
            className="data-[state=active]:bg-accent"
          >
            Profile
          </TabsTrigger>
        </TabsList>
        <TabsContent value="home">
          <GMBase sponsored={isBaseApp} allowedChainIds={allowedChainIds} />
        </TabsContent>
        <TabsContent value="profile">
          <Profile
            isSmartWallet={isSmartWallet}
            user={user}
            onDisconnected={onProfileDisconnected}
            allowedChainIds={allowedChainIds}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
