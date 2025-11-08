"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GMBase } from "@/components/gm-base"
import { RewardsBase } from "@/components/rewards-base"

import { useMiniAppContext } from "./providers/miniapp-provider"

interface HomeTabsProps {
  tab: string
  onTabChange: (tab: string) => void
}

export function HomeTabs({ tab, onTabChange }: HomeTabsProps) {
  const miniAppContext = useMiniAppContext()

  const isInMiniApp = !!miniAppContext?.isInMiniApp
  const isBaseApp = miniAppContext?.context?.client.clientFid === 309857
  const isFarcaster = miniAppContext?.context?.client.clientFid === 1

  const allowedChainIds = isFarcaster
    ? [8453, 42220, 10]
    : isBaseApp
      ? [8453, 10]
      : [8453, 42220, 10]

  return (
    <div className="mt-4 mb-6">
      <Tabs value={tab} onValueChange={onTabChange}>
        <TabsList className="bg-background border-border flex h-12 w-full gap-2 rounded-lg border">
          <TabsTrigger value="home" className="data-[state=active]:bg-accent">
            Home
          </TabsTrigger>
          {isInMiniApp && (
            <TabsTrigger
              value="rewards"
              className="data-[state=active]:bg-accent"
            >
              Rewards
            </TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="home">
          <GMBase sponsored={isBaseApp} allowedChainIds={allowedChainIds} />
        </TabsContent>
        <TabsContent value="rewards">
          <RewardsBase sponsored={isBaseApp} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
