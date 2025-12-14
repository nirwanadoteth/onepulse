"use client";

import { memo } from "react";
import { HeaderRight } from "@/components/header/header-right";
import { useHeaderLogic } from "@/components/header/use-header-logic";
import { ShareModal } from "@/components/share-modal";
import { UserInfo } from "@/components/user-info";
import type { GmStats } from "@/hooks/use-gm-stats";
import { minikitConfig } from "@/minikit.config";

type HeaderProps = {
  isMiniAppReady: boolean;
  inMiniApp: boolean;
  onMiniAppAddedAction: () => void;
  gmStats?: GmStats;
  isShareModalOpen: boolean;
  onShareModalOpenChangeAction: (open: boolean) => void;
  completedAllChains?: boolean;
};

export const Header = memo(
  ({
    isMiniAppReady,
    inMiniApp,
    onMiniAppAddedAction,
    gmStats,
    isShareModalOpen,
    onShareModalOpenChangeAction,
    completedAllChains,
  }: HeaderProps) => {
    const {
      address,
      user,
      shouldShowUserInfo,
      canConfigureMiniApp,
      isMiniAppSaved,
      isNotificationsEnabled,
      showAdminButton,
      showShareButton,
      handleAddMiniApp,
      handleShareClick,
    } = useHeaderLogic({
      isMiniAppReady,
      inMiniApp,
      onMiniAppAddedAction,
      gmStats,
      onShareModalOpenChangeAction,
    });
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
            canConfigureMiniApp={canConfigureMiniApp}
            inMiniApp={inMiniApp}
            isMiniAppSaved={isMiniAppSaved}
            notificationsEnabled={isNotificationsEnabled}
            onNotificationToggle={handleAddMiniApp}
            onSaveClick={handleAddMiniApp}
            onShareClick={handleShareClick}
            showAdminButton={showAdminButton}
            showShareButton={showShareButton}
          />
        </div>

        <ShareModal
          completedAllChains={completedAllChains}
          onOpenChange={onShareModalOpenChangeAction}
          open={isShareModalOpen}
        />
      </div>
    );
  }
);
Header.displayName = "Header";
