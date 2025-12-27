"use client";

import { useCallback, useEffect, useState } from "react";

const MINI_APP_SHARE_KEY = "mini-app-shared-today";

function getTodayKey(): string {
  const today = new Date();
  return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
}

function getStorageKey(): string {
  return `${MINI_APP_SHARE_KEY}-${getTodayKey()}`;
}

export function useMiniAppSharing() {
  const [hasSharedToday, setHasSharedToday] = useState(false);

  // Check if user has shared today on mount
  useEffect(() => {
    const storageKey = getStorageKey();
    const stored = localStorage.getItem(storageKey);
    setHasSharedToday(stored === "true");
  }, []);

  const markAsShared = useCallback(() => {
    const storageKey = getStorageKey();
    localStorage.setItem(storageKey, "true");
    setHasSharedToday(true);
  }, []);

  const shareMiniApp = useCallback(async (): Promise<boolean> => {
    try {
      // Import here to avoid issues with SSR
      const { sdk } = await import("@farcaster/miniapp-sdk");

      const result = await sdk.actions.composeCast({
        text: "Just discovered this awesome mini app! Check it out 🚀",
        embeds: [window.location.origin],
      });

      // If result is undefined, user didn't cast (saved to draft or closed)
      const success = result !== undefined;
      if (success) {
        markAsShared();
      }
      return success;
    } catch (error) {
      console.error("Failed to share mini app:", error);
      return false;
    }
  }, [markAsShared]);

  return {
    hasSharedToday,
    shareMiniApp,
  };
}
