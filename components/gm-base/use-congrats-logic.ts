"use client";

import { useEffect, useState } from "react";

import { getCurrentDay } from "./chain-config";

type UseCongratsLogicProps = {
  allDone: boolean;
  isConnected: boolean;
  lastCongratsDay: number | null;
  onLastCongratsDayUpdate: (day: number) => void;
};

/**
 * Manages congratulations dialog display logic
 * Shows dialog when all chains are complete and not already shown today
 */
export function useCongratsLogic({
  allDone,
  isConnected,
  lastCongratsDay,
  onLastCongratsDayUpdate,
}: UseCongratsLogicProps) {
  const [showCongrats, setShowCongrats] = useState(false);

  useEffect(() => {
    if (!(allDone && isConnected)) {
      return;
    }
    const today = getCurrentDay();
    if (lastCongratsDay === today) {
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    timeoutId = setTimeout(() => {
      setShowCongrats(true);
      onLastCongratsDayUpdate(today);
    }, 0);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [allDone, isConnected, lastCongratsDay, onLastCongratsDayUpdate]);

  return { showCongrats, setShowCongrats };
}
