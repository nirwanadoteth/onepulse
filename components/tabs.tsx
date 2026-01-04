"use client";

import { Gift, House, MessageCircle, TrendingUp } from "lucide-react";
import dynamic from "next/dynamic";
import { useChainId, useSwitchChain } from "wagmi";
import { Home } from "@/components/home";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs as TabsComponent,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import type { useGmStats } from "@/hooks/use-gm-stats";
import { BASE_CHAIN_ID } from "@/lib/constants";
import { useTabsLogic } from "./tabs/use-tabs-logic";

const Leaderboard = dynamic(
  () =>
    import("@/components/leaderboard/leaderboard").then(
      (mod) => mod.Leaderboard
    ),
  {
    loading: () => <Skeleton className="h-125 w-full rounded-xl" />,
  }
);

const OnChatWidget = dynamic(
  () => import("@/components/onchat-widget").then((mod) => mod.OnChatWidget),
  {
    loading: () => <Skeleton className="h-125 w-full rounded-xl" />,
  }
);

const Rewards = dynamic(
  () => import("@/components/rewards").then((mod) => mod.Rewards),
  {
    loading: () => <Skeleton className="h-125 w-full rounded-xl" />,
  }
);

type TabsProps = {
  tab: string;
  onTabChangeAction: (tab: string) => void;
  onGmStatsChangeAction: (stats: ReturnType<typeof useGmStats>) => void;
};

export function Tabs({
  tab,
  onTabChangeAction,
  onGmStatsChangeAction,
}: TabsProps) {
  const { isBaseApp, allowedChainIds } = useTabsLogic();
  const chainId = useChainId();
  const switchChain = useSwitchChain();
  const isOnBaseChain = chainId === BASE_CHAIN_ID;

  return (
    <div className="my-4">
      <TabsComponent onValueChange={onTabChangeAction} value={tab}>
        <TabsContent value="home">
          <Home
            allowedChainIds={allowedChainIds}
            onGmStatsChangeAction={onGmStatsChangeAction}
            sponsored={isBaseApp}
          />
        </TabsContent>
        <TabsContent value="rewards">
          <Rewards sponsored={isBaseApp} />
        </TabsContent>
        <TabsContent value="leaderboard">
          <Leaderboard />
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
              <TabsTrigger
                className="flex h-full flex-col items-center justify-center gap-1 border-0 data-[state=active]:bg-foreground/10"
                value="leaderboard"
              >
                <TrendingUp className="h-5 w-5" />
                <span className="text-xs">Top</span>
              </TabsTrigger>
            </TabsList>
            {/* Floating Chat Button */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  className="absolute -top-12 right-4 h-8 w-8 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
                  onClick={() => {
                    if (!isOnBaseChain) {
                      switchChain.mutate({ chainId: BASE_CHAIN_ID });
                    }
                  }}
                  size="icon-sm"
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="max-h-150 w-80 p-0 md:w-100"
                side="top"
              >
                {isOnBaseChain ? (
                  <OnChatWidget />
                ) : (
                  <div className="flex h-32 items-center justify-center p-4">
                    <div className="text-center">
                      <MessageCircle className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground text-sm">
                        Switching to Base network...
                      </p>
                    </div>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </TabsComponent>
    </div>
  );
}
