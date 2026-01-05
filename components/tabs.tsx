"use client";

import { House, MessageCircle } from "lucide-react";
import dynamic from "next/dynamic";
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
import { useTabsLogic } from "./tabs/use-tabs-logic";

const OnChatWidget = dynamic(
  () => import("@/components/onchat-widget").then((mod) => mod.OnChatWidget),
  {
    loading: () => <Skeleton className="h-125 w-full rounded-xl" />,
  }
);

type TabsProps = {
  tab: string;
  onTabChangeAction: (tab: string) => void;
};

export function Tabs({ tab, onTabChangeAction }: TabsProps) {
  const { isBaseApp } = useTabsLogic();

  return (
    <div className="my-4">
      <TabsComponent onValueChange={onTabChangeAction} value={tab}>
        <TabsContent value="home">
          <Home sponsored={isBaseApp} />
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
            </TabsList>
            {/* Floating Chat Button */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  className="absolute -top-12 right-4 h-8 w-8 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
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
                <OnChatWidget />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </TabsComponent>
    </div>
  );
}
