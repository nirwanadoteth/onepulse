"use client";

import {
  Bookmark,
  BookOpenText,
  EllipsisVertical,
  Info,
  RefreshCcw,
  Settings,
  Share2,
} from "lucide-react";
import { memo, useCallback, useRef, useState } from "react";
import {
  BASE_APP_PROFILE_URL,
  FARCASTER_PROFILE_URL,
  PROFILE_FID,
  TWITTER_URL,
  useAboutLogic,
} from "@/components/about/use-about-logic";
import { AdminModal } from "@/components/admin/admin-modal";
import { AboutDialog } from "@/components/header/about-dialog";
import { HowItWorksDialog } from "@/components/header/how-it-works-dialog";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Toggle } from "@/components/ui/toggle";

type HeaderRightProps = {
  canConfigureMiniApp: boolean;
  isMiniAppSaved: boolean;
  showAdminButton: boolean;
  showShareButton: boolean;
  inMiniApp: boolean;
  onSaveClick: () => Promise<void> | void;
  onShareClick: () => void;
};

export const HeaderRight = memo(
  ({
    canConfigureMiniApp,
    isMiniAppSaved,
    showAdminButton,
    showShareButton,
    inMiniApp,
    onSaveClick,
    onShareClick,
  }: HeaderRightProps) => {
    const [aboutOpen, setAboutOpen] = useState(false);
    const [howItWorksOpen, setHowItWorksOpen] = useState(false);
    const [adminModalOpen, setAdminModalOpen] = useState(false);
    const [isMenuBusy, setIsMenuBusy] = useState(false);
    const isMenuBusyRef = useRef(false);
    const { handleOpenUrl, handleViewProfile } = useAboutLogic();

    const handleReload = useCallback(() => {
      window.location.reload();
    }, []);

    const runMenuAction = useCallback(
      async (action: () => Promise<void> | void) => {
        if (isMenuBusyRef.current) {
          return;
        }
        isMenuBusyRef.current = true;
        setIsMenuBusy(true);
        try {
          await action();
        } finally {
          setIsMenuBusy(false);
          isMenuBusyRef.current = false;
        }
      },
      []
    );

    const saveDisabled = !canConfigureMiniApp || isMiniAppSaved;

    const handleFarcasterClick = useCallback(() => {
      if (inMiniApp) {
        handleViewProfile(PROFILE_FID);
        return;
      }
      handleOpenUrl(FARCASTER_PROFILE_URL);
    }, [handleOpenUrl, handleViewProfile, inMiniApp]);

    const handleBaseAppClick = useCallback(() => {
      if (inMiniApp) {
        handleViewProfile(PROFILE_FID);
        return;
      }
      handleOpenUrl(BASE_APP_PROFILE_URL);
    }, [handleOpenUrl, handleViewProfile, inMiniApp]);

    const handleXClick = useCallback(() => {
      handleOpenUrl(TWITTER_URL);
    }, [handleOpenUrl]);

    return (
      <div className="flex items-center gap-1">
        <Button
          className="group/toggle extend-touch-target size-8"
          onClick={handleReload}
          size="icon"
          title="Reload"
          variant="outline"
        >
          <RefreshCcw className="size-4.5" />
          <span className="sr-only">Reload</span>
        </Button>
        {showShareButton && (
          <Button
            className="group/toggle extend-touch-target size-8"
            onClick={onShareClick}
            size="icon"
            title="Share"
            variant="outline"
          >
            <Share2 className="size-4.5" />
            <span className="sr-only">Share</span>
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-label="Open settings"
              className="group/toggle extend-touch-target size-8"
              variant="outline"
            >
              <EllipsisVertical className="size-4.5" />
              <span className="sr-only">Settings</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {showAdminButton && (
              <>
                <DropdownMenuItem onClick={() => setAdminModalOpen(true)}>
                  <Settings className="size-4" />
                  Admin
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            {inMiniApp && !isMiniAppSaved && (
              <>
                <DropdownMenuItem
                  className="flex items-center justify-between"
                  disabled={saveDisabled || isMenuBusy}
                  onSelect={(event) => event.preventDefault()}
                >
                  <span className="flex items-center gap-2">
                    <Bookmark className="size-4" />
                    Save Mini App
                  </span>
                  <Toggle
                    aria-label="Toggle save mini app"
                    disabled={saveDisabled || isMenuBusy}
                    onPressedChange={(nextPressed) => {
                      if (!nextPressed) {
                        return;
                      }
                      runMenuAction(onSaveClick);
                    }}
                    pressed={isMiniAppSaved}
                    size="sm"
                    variant="outline"
                  >
                    {isMiniAppSaved ? "On" : "Off"}
                  </Toggle>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}

            <DropdownMenuItem onClick={() => setAboutOpen(true)}>
              <Info className="size-4" />
              About
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setHowItWorksOpen(true)}>
              <BookOpenText className="size-4" />
              How It Works
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuLabel>Social</DropdownMenuLabel>
            <DropdownMenuItem onClick={handleFarcasterClick}>
              <Icons.farcaster className="size-4" />
              Farcaster
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleBaseAppClick}>
              <Icons.baseSquare className="size-4" />
              Base app
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleXClick}>
              <Icons.twitter className="size-4" />X
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <AboutDialog onOpenChangeAction={setAboutOpen} open={aboutOpen} />
        <HowItWorksDialog
          onOpenChangeAction={setHowItWorksOpen}
          open={howItWorksOpen}
        />
        <AdminModal
          onOpenChangeAction={setAdminModalOpen}
          open={adminModalOpen}
        />
      </div>
    );
  }
);
