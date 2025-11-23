"use client";

import { sdk } from "@farcaster/miniapp-sdk";
import { useAppKitAccount } from "@reown/appkit/react";
import { Bookmark, Share2 } from "lucide-react";
import { memo, useCallback, useState } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import {
  type MiniAppContext,
  type UserContext,
  useMiniAppContext,
} from "@/components/providers/miniapp-provider";
import { ShareModal } from "@/components/share-modal";
import { Button } from "@/components/ui/button";
import { UserInfo } from "@/components/user-info";
import type { GmStats } from "@/hooks/use-gm-stats";
import {
  ERROR_MESSAGES,
  extractErrorMessage,
  handleError,
  handleSuccess,
  SUCCESS_MESSAGES,
} from "@/lib/error-handling";
import { shouldShowShareButton } from "@/lib/share";
import { canSaveMiniApp } from "@/lib/utils";
import { minikitConfig } from "@/minikit.config";

type HeaderProps = {
  isMiniAppReady: boolean;
  inMiniApp: boolean;
  onMiniAppAddedAction: () => void;
  gmStats?: GmStats;
  isShareModalOpen: boolean;
  onShareModalOpenChangeAction: (open: boolean) => void;
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
  showShareButton: boolean;
  onSaveClick: () => void;
  onShareClick: () => void;
};

const HeaderRight = memo(
  ({
    showSaveButton,
    showShareButton,
    onSaveClick,
    onShareClick,
  }: HeaderRightProps) => (
    <div className="flex items-center gap-1">
      {showShareButton && (
        <Button
          className="group/toggle extend-touch-target size-8"
          onClick={onShareClick}
          size="icon"
          title="Share"
          variant="ghost"
        >
          <Share2 className="size-4.5" />
          <span className="sr-only">Share</span>
        </Button>
      )}
      {showSaveButton && (
        <Button
          className="group/toggle extend-touch-target size-8"
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
  onMiniAppAddedAction,
  gmStats,
  isShareModalOpen,
  onShareModalOpenChangeAction,
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
      onMiniAppAddedAction();
    } catch (error) {
      handleError(error, ERROR_MESSAGES.MINI_APP_ADD, {
        operation: "mini-app-add",
        errorMessage: extractErrorMessage(error),
      });
    }
  }, [onMiniAppAddedAction]);

  const handleShareClick = useCallback(
    () => onShareModalOpenChangeAction(true),
    [onShareModalOpenChangeAction]
  );

  const user = extractUserFromContext(miniAppContextData?.context);
  const clientAdded = miniAppContextData?.context?.client?.added;
  const showSaveButton =
    canSaveMiniApp({
      isMiniAppReady,
      inMiniApp,
      clientAdded,
    }) && !miniAppAddedLocally;

  const shouldShowUserInfo = !!user || !!address;
  const showShareButton = shouldShowShareButton(gmStats);

  return (
    <div className="fixed top-0 right-0 left-0 z-50 mx-auto h-16 w-full max-w-lg bg-transparent">
      <div className="flex h-16 items-center justify-between rounded-b-lg border border-border bg-background px-4 shadow-lg">
        <div className="flex-1">
          {shouldShowUserInfo ? (
            <UserInfo address={address} user={user} />
          ) : (
            <div className="font-bold text-2xl">
              {minikitConfig.miniapp.name}
            </div>
          )}
        </div>
        <HeaderRight
          onSaveClick={handleAddMiniApp}
          onShareClick={handleShareClick}
          showSaveButton={showSaveButton}
          showShareButton={showShareButton}
        />
      </div>

      <ShareModal
        gmStats={gmStats}
        onOpenChange={onShareModalOpenChangeAction}
        open={isShareModalOpen}
      />
    </div>
  );
}
