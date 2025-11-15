"use client";

import { sdk } from "@farcaster/miniapp-sdk";
import { useAppKitAccount } from "@reown/appkit/react";
import { Bookmark } from "lucide-react";
import { memo, useCallback, useState } from "react";
import { toast } from "sonner";
import { ModeToggle } from "@/components/mode-toggle";
import {
  type MiniAppContext,
  type UserContext,
  useMiniAppContext,
} from "@/components/providers/miniapp-provider";
import { Button } from "@/components/ui/button";
import { UserInfo } from "@/components/user-info";
import { minikitConfig } from "@/minikit.config";

type HeaderProps = {
  isFrameReady: boolean;
  inMiniApp: boolean;
  onMiniAppAdded: () => void;
};

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

const shouldShowSaveButton = (
  isFrameReady: boolean,
  inMiniApp: boolean,
  clientAdded: boolean | undefined
): boolean => isFrameReady && inMiniApp && clientAdded !== true;

type HeaderRightProps = {
  showSaveButton: boolean;
  onSaveClick: () => void;
};

const HeaderRight = memo(
  ({ showSaveButton, onSaveClick }: HeaderRightProps) => (
    <div>
      {showSaveButton && (
        <Button
          className="group/toggle extend-touch-target mr-2 size-8"
          onClick={onSaveClick}
          size="icon"
          title="Save"
          variant="ghost"
        >
          <Bookmark className="size-4.5" />
          <span className="sr-only">Save</span>
        </Button>
      )}
      <ModeToggle />
    </div>
  )
);

export function Header({
  isFrameReady,
  inMiniApp,
  onMiniAppAdded,
}: HeaderProps) {
  const miniAppContextData = useMiniAppContext();
  const { address } = useAppKitAccount({ namespace: "eip155" });
  const [miniAppAddedLocally, setMiniAppAddedLocally] = useState(false);

  const handleAddMiniApp = useCallback(async () => {
    try {
      const response = await sdk.actions.addMiniApp();

      if (response.notificationDetails) {
        toast.success("Saved");
      } else {
        toast.success("Saved without notification");
      }

      setMiniAppAddedLocally(true);
      onMiniAppAdded();
    } catch (error) {
      toast.error(`Error: ${error}`);
    }
  }, [onMiniAppAdded]);

  const user = extractUserFromContext(miniAppContextData?.context);
  const clientAdded = miniAppContextData?.context?.client?.added;
  const showSaveButton =
    shouldShowSaveButton(isFrameReady, inMiniApp, clientAdded) &&
    !miniAppAddedLocally;

  const shouldShowUserInfo = !!user || !!address;

  return (
    <div className="sticky top-4 mt-1 flex h-16 items-center justify-between rounded-lg border border-border bg-background px-2">
      <div className="flex-1">
        {shouldShowUserInfo ? (
          <UserInfo address={address} user={user} />
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
