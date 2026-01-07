"use client";

import type { JSX } from "react";
import { useHeaderLogic } from "@/components/header/use-header-logic";
import { UserInfo } from "@/components/user-info";
import { minikitConfig } from "@/minikit.config";

export function Header(): JSX.Element {
  const { address, shouldShowUserInfo } = useHeaderLogic();
  return (
    <div className="fixed top-0 right-0 left-0 z-20 mx-auto h-16 w-full max-w-lg bg-transparent">
      <div className="flex h-16 items-center justify-between rounded-b-lg border border-border bg-background px-4 shadow-lg">
        <div className="flex-1">
          {shouldShowUserInfo ? (
            <UserInfo address={address} />
          ) : (
            <div className="font-bold text-2xl">
              {minikitConfig.miniapp.name}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
