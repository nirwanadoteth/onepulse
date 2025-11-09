"use client";

import { sdk } from "@farcaster/miniapp-sdk";
import { Bookmark } from "lucide-react";
import React, { useCallback } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { HeaderUserInfo } from "@/components/header-user-info";
import { ModeToggle } from "@/components/mode-toggle";
import {
  type MiniAppContext,
  type UserContext,
  useMiniAppContext,
} from "@/components/providers/miniapp-provider";
import { Button } from "@/components/ui/button";
import { minikitConfig } from "@/minikit.config";

type HomeHeaderProps = {
  isFrameReady: boolean;
  inMiniApp: boolean;
  onMiniAppAdded: () => void;
};

// Extract user from context
const extractUserFromContext = (
  context: MiniAppContext | null | undefined
): UserContext | undefined =>
  context?.user
    ? {
        fid: context.user.fid,
        displayName: context.user.displayName,
        username: context.user.username,
        pfpUrl: context.user.pfpUrl,
      }
    : undefined;

// Determine if save button should be shown
const shouldShowSaveButton = (
  isFrameReady: boolean,
  inMiniApp: boolean,
  clientAdded: boolean | undefined
): boolean => isFrameReady && inMiniApp && clientAdded !== true;

// Handle mini app addition with notifications
const handleAddMiniAppAction = async (onMiniAppAdded: () => void) => {
  try {
    const response = await sdk.actions.addMiniApp();

    if (response.notificationDetails) {
      toast.success("Mini App added");
    } else {
      toast.success("Mini App added without");
    }
    onMiniAppAdded();
  } catch (error) {
    toast.error(`Error: ${error}`);
  }
};

// Subcomponent for right side (save button & theme toggle)
type HeaderRightProps = {
  showSaveButton: boolean;
  onSaveClick: () => void;
};

const HeaderRight = React.memo(
  ({ showSaveButton, onSaveClick }: HeaderRightProps) => (
    <div>
      {showSaveButton && (
        <Button
          className="mr-2"
          onClick={onSaveClick}
          size={"sm"}
          variant={"outline"}
        >
          <Bookmark />
          Save
        </Button>
      )}
      <ModeToggle />
    </div>
  )
);

export function HomeHeader({
  isFrameReady,
  inMiniApp,
  onMiniAppAdded,
}: HomeHeaderProps) {
  const miniAppContextData = useMiniAppContext();
  const { address } = useAccount();

  const handleAddMiniApp = useCallback(
    () => handleAddMiniAppAction(onMiniAppAdded),
    [onMiniAppAdded]
  );

  const user = extractUserFromContext(miniAppContextData?.context);
  const showSaveButton = shouldShowSaveButton(
    isFrameReady,
    inMiniApp,
    miniAppContextData?.context?.client?.added
  );

  // Show user info if user exists from Farcaster context OR if wallet is connected
  // Otherwise show app name
  const shouldShowUserInfo = !!user || !!address;

  return (
    <div className="mt-3 mb-6 flex items-center justify-between">
      <div className="flex-1">
        {shouldShowUserInfo ? (
          <HeaderUserInfo address={address} user={user} />
        ) : (
          <div className="font-bold text-2xl">{minikitConfig.miniapp.name}</div>
        )}
      </div>
      <HeaderRight
        onSaveClick={handleAddMiniApp}
        showSaveButton={showSaveButton}
      />
    </div>
  );
}
