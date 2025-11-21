"use client";

import { Gift, House, Info } from "lucide-react";
import { Home } from "@/components/home";
import { useMiniAppContext } from "@/components/providers/miniapp-provider";
import { Rewards } from "@/components/rewards";
import {
  Tabs as TabsComponent,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import type { useGmStats } from "@/hooks/use-gm-stats";
import {
  BASE_CHAIN_ID,
  CELO_CHAIN_ID,
  OPTIMISM_CHAIN_ID,
} from "@/lib/constants";
import { About } from "./about";

type TabsProps = {
  tab: string;
  onTabChangeAction: (tab: string) => void;
  onGmStatsChangeAction: (stats: ReturnType<typeof useGmStats>) => void;
  onShareClickAction: () => void;
};

export function Tabs({
  tab,
  onTabChangeAction,
  onGmStatsChangeAction,
  onShareClickAction,
}: TabsProps) {
  const miniAppContext = useMiniAppContext();

  const isBaseApp = miniAppContext?.context?.client.clientFid === 309_857;

  const allowedChainIds = isBaseApp
    ? [BASE_CHAIN_ID, OPTIMISM_CHAIN_ID]
    : [BASE_CHAIN_ID, CELO_CHAIN_ID, OPTIMISM_CHAIN_ID];

  return (
    <div className="my-4">
      <TabsComponent onValueChange={onTabChangeAction} value={tab}>
        <TabsContent value="home">
          <Home
            allowedChainIds={allowedChainIds}
            onGmStatsChange={onGmStatsChangeAction}
            onShareClick={onShareClickAction}
            sponsored={isBaseApp}
          />
        </TabsContent>
        <TabsContent value="rewards">
          <Rewards sponsored={isBaseApp} />
        </TabsContent>
        <TabsContent value="about">
          <About />
        </TabsContent>
        <div className="fixed right-0 bottom-0 left-0 mx-auto h-18 w-full max-w-lg bg-transparent px-4 py-1">
          <div className="mb-1 h-16 rounded-lg border border-border bg-background p-2">
            <TabsList className="mx-auto flex h-12 w-full max-w-lg gap-2 rounded-lg bg-background p-0 py-0">
              <TabsTrigger
                className="flex h-full flex-col items-center justify-center gap-1 border-0 data-[state=active]:bg-foreground/10"
                value="home"
              >
                <House className="h-5 w-5" />
                <span className="text-xs">Home</span>
              </TabsTrigger>
              <TabsTrigger
                className="flex h-full flex-col items-center justify-center gap-1 border-0 data-[state=active]:bg-foreground/10"
                value="rewards"
              >
                <Gift className="h-5 w-5" />
                <span className="text-xs">Rewards</span>
              </TabsTrigger>
              <TabsTrigger
                className="flex h-full flex-col items-center justify-center gap-1 border-0 data-[state=active]:bg-foreground/10"
                value="about"
              >
                <Info className="h-5 w-5" />
                <span className="text-xs">About</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>
      </TabsComponent>
    </div>
  );
}
