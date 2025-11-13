"use client";

import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { sdk } from "@farcaster/miniapp-sdk";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export type MiniAppNotificationDetails = {
  url: string;
  token: string;
};
export type MiniAppPlatformType = "web" | "mobile";
export type MiniAppUser = {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
};
export type MiniAppCast = {
  author: MiniAppUser;
  hash: string;
  parentHash?: string;
  parentFid?: number;
  timestamp?: number;
  mentions?: MiniAppUser[];
  text: string;
  embeds?: string[];
  channelKey?: string;
};
export type CastEmbedLocationContext = {
  type: "cast_embed";
  embed: string;
  cast: MiniAppCast;
};
export type CastShareLocationContext = {
  type: "cast_share";
  cast: MiniAppCast;
};
export type NotificationLocationContext = {
  type: "notification";
  notification: {
    notificationId: string;
    title: string;
    body: string;
  };
};
export type LauncherLocationContext = {
  type: "launcher";
};
export type ChannelLocationContext = {
  type: "channel";
  channel: {
    key: string;
    name: string;
    imageUrl?: string;
  };
};
export type OpenMiniAppLocationContext = {
  type: "open_miniapp";
  referrerDomain: string;
};
export type LocationContext =
  | CastEmbedLocationContext
  | CastShareLocationContext
  | NotificationLocationContext
  | LauncherLocationContext
  | ChannelLocationContext
  | OpenMiniAppLocationContext;
export type AccountLocation = {
  placeId: string;
  description: string;
};
export type UserContext = {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  location?: AccountLocation;
};
export type SafeAreaInsets = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};
export type ClientContext = {
  platformType?: MiniAppPlatformType;
  clientFid: number;
  added: boolean;
  notificationDetails?: MiniAppNotificationDetails;
  safeAreaInsets?: SafeAreaInsets;
};
export type ClientFeatures = {
  haptics: boolean;
  cameraAndMicrophoneAccess?: boolean;
};
export type MiniAppContext = {
  client: ClientContext;
  user: UserContext;
  location?: LocationContext;
  features?: ClientFeatures;
};

type MiniAppContextType = {
  context: MiniAppContext | null;
  isInMiniApp: boolean;
} | null;

const MiniAppContext = createContext<MiniAppContextType>(null);

export const useMiniAppContext = () => useContext(MiniAppContext);

export function MiniAppProvider({ children }: { children: ReactNode }) {
  const [miniAppContext, setMiniAppContext] =
    useState<MiniAppContextType>(null);
  const { context } = useMiniKit();

  useEffect(() => {
    const init = async () => {
      try {
        const inMiniApp = await sdk.isInMiniApp();

        setMiniAppContext({
          context,
          isInMiniApp: inMiniApp,
        });
      } catch {
        // MiniApp initialization failure handled gracefully
        setMiniAppContext({
          context: null,
          isInMiniApp: false,
        });
      }
    };

    init();
  }, [context]);

  return (
    <MiniAppContext.Provider value={miniAppContext}>
      {children}
    </MiniAppContext.Provider>
  );
}
