import { sdk } from "@farcaster/miniapp-sdk";
import { useAppKitAccount } from "@reown/appkit/react";
import { useCallback } from "react";
import {
  type MiniAppContext,
  type UserContext,
  useMiniAppContext,
} from "@/components/providers/miniapp-provider";
import { useContractOwner } from "@/hooks/use-contract-owner";
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

type UseHeaderLogicProps = {
  isMiniAppReady: boolean;
  inMiniApp: boolean;
  onMiniAppAddedAction: () => void;
  gmStats?: GmStats;
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

export const useHeaderLogic = ({
  isMiniAppReady,
  inMiniApp,
  onMiniAppAddedAction,
  gmStats,
  onShareModalOpenChangeAction,
}: UseHeaderLogicProps) => {
  const { address } = useAppKitAccount({ namespace: "eip155" });
  const miniAppContext = useMiniAppContext();
  const { owner } = useContractOwner();
  const clientAdded = miniAppContext?.context?.client?.added;
  const notificationsEnabled =
    miniAppContext?.context?.client?.notificationDetails;

  const handleAddMiniApp = useCallback(async () => {
    try {
      const response = await sdk.actions.addMiniApp();
      const hasNotifications = Boolean(response.notificationDetails);
      if (hasNotifications) {
        handleSuccess(SUCCESS_MESSAGES.MINI_APP_ADDED);
      } else {
        handleSuccess(SUCCESS_MESSAGES.MINI_APP_ADDED_NO_NOTIF);
      }

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

  const user = extractUserFromContext(miniAppContext?.context);
  const shouldShowUserInfo = !!user || !!address;
  const showAdminButton = Boolean(
    address && owner && address.toLowerCase() === owner.toLowerCase()
  );
  const isMiniAppSaved = Boolean(clientAdded);
  const isNotificationsEnabled = Boolean(notificationsEnabled);
  const canConfigureMiniApp = canSaveMiniApp({
    isMiniAppReady,
    inMiniApp,
    clientAdded,
  });

  const showShareButton = shouldShowShareButton(gmStats);

  return {
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
  };
};
