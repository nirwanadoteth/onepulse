"use client";

import { useColorSchemeSyncLogic } from "./use-color-scheme-sync-logic";

/**
 * Keeps documentElement.style.colorScheme in sync with the resolved theme.
 * This avoids SSR hydration differences while ensuring native controls match theme post-hydration.
 */
export function ColorSchemeSync() {
  useColorSchemeSyncLogic();

  return null;
}
