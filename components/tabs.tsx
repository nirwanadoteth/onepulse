"use client";

import { Gift, House } from "lucide-react";
import { Home } from "@/components/home";
import { Rewards } from "@/components/rewards";
import {
  Tabs as TabsComponent,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import type { useGmStats } from "@/hooks/use-gm-stats";
import { useTabsLogic } from "./tabs/use-tabs-logic";

type TabsProps = {
  tab: string;
  onTabChangeAction: (tab: string) => void;
  onGmStatsChangeAction: (stats: ReturnType<typeof useGmStats>) => void;
  onShareClickAction: () => void;
  onAllDoneChangeAction?: (allDone: boolean) => void;
};

export function Tabs({
  tab,
  onTabChangeAction,
  onGmStatsChangeAction,
  onShareClickAction,
  onAllDoneChangeAction,
}: TabsProps) {
  const { isBaseApp, allowedChainIds } = useTabsLogic();

  return (
    <div className="my-4">
      <TabsComponent onValueChange={onTabChangeAction} value={tab}>
        <TabsContent value="home">
          <Home
            allowedChainIds={allowedChainIds}
            onAllDoneChange={onAllDoneChangeAction}
            onGmStatsChange={onGmStatsChangeAction}
            onShareClick={onShareClickAction}
            sponsored={isBaseApp}
          />
        </TabsContent>
        <TabsContent value="rewards">
          <Rewards sponsored={isBaseApp} />
        </TabsContent>
        <div className="fixed right-0 bottom-0 left-0 mx-auto h-16 w-full max-w-lg bg-transparent">
          <div className="h-16 rounded-t-lg border border-border bg-transparent shadow-lg">
            <TabsList className="mx-auto flex h-full w-full max-w-lg gap-2 rounded-t-lg bg-background p-0 py-0">
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
            </TabsList>
          </div>
        </div>
      </TabsComponent>
    </div>
  );
}
