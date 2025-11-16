"use client";

import { sdk } from "@farcaster/miniapp-sdk";
import { useAppKitAccount } from "@reown/appkit/react";
import { Bookmark } from "lucide-react";
import { memo, useCallback, useState } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import {
  type MiniAppContext,
  type UserContext,
  useMiniAppContext,
} from "@/components/providers/miniapp-provider";
import { Button } from "@/components/ui/button";
import { UserInfo } from "@/components/user-info";
import {
  ERROR_MESSAGES,
  extractErrorMessage,
  handleError,
  handleSuccess,
  SUCCESS_MESSAGES,
} from "@/lib/error-handling";
import { canSaveMiniApp } from "@/lib/utils";
import { minikitConfig } from "@/minikit.config";

type HeaderProps = {
  isMiniAppReady: boolean;
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
  isMiniAppReady,
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
        handleSuccess(SUCCESS_MESSAGES.MINI_APP_ADDED);
      } else {
        handleSuccess(SUCCESS_MESSAGES.MINI_APP_ADDED_NO_NOTIF);
      }

      setMiniAppAddedLocally(true);
      onMiniAppAdded();
    } catch (error) {
      handleError(error, ERROR_MESSAGES.MINI_APP_ADD, {
        operation: "mini-app-add",
        errorMessage: extractErrorMessage(error),
      });
    }
  }, [onMiniAppAdded]);

  const user = extractUserFromContext(miniAppContextData?.context);
  const clientAdded = miniAppContextData?.context?.client?.added;
  const showSaveButton =
    canSaveMiniApp({
      isMiniAppReady,
      inMiniApp,
      clientAdded,
    }) && !miniAppAddedLocally;

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
