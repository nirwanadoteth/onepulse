"use client";

import { useEffect, useState } from "react";
import { getCurrentDay } from "@/lib/utils";

type UseCongratsLogicProps = {
  allDone: boolean;
  isConnected: boolean;
  lastCongratsDay: number | null;
  onLastCongratsDayUpdateAction: (day: number) => void;
};

/**
 * Manages congratulations dialog display logic
 * Shows dialog when all chains are complete and not already shown today
 */
export function useCongratsLogic({
  allDone,
  isConnected,
  lastCongratsDay,
  onLastCongratsDayUpdateAction,
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

    // Schedule as microtask to avoid blocking current render
    queueMicrotask(() => {
      setShowCongrats(true);
      onLastCongratsDayUpdateAction(today);
    });
  }, [allDone, isConnected, lastCongratsDay, onLastCongratsDayUpdateAction]);

  return { showCongrats, setShowCongrats };
}
