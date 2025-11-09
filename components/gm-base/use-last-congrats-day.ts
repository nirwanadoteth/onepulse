"use client";

import { useEffect, useState } from "react";

const CONGRATS_KEY = "onepulse:last-congrats-day";

/**
 * Manages persistent storage of last congratulations day
 * Handles localStorage safely and returns current day value + setter
 */
export function useLastCongratsDay() {
  const [lastCongratsDay, setLastCongratsDay] = useState<number | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }
    const stored = window.localStorage.getItem(CONGRATS_KEY);
    if (!stored) {
      return null;
    }
    const parsed = Number.parseInt(stored, 10);
    return Number.isNaN(parsed) ? null : parsed;
  });

  // Persist to localStorage when value changes
  useEffect(() => {
    if (lastCongratsDay == null) {
      return;
    }
    if (typeof window === "undefined") {
      return;
    }
    try {
      window.localStorage.setItem(CONGRATS_KEY, String(lastCongratsDay));
    } catch {
      // Ignore persistence errors (e.g., quota exceeded, private mode)
    }
  }, [lastCongratsDay]);

  return { lastCongratsDay, setLastCongratsDay };
}
