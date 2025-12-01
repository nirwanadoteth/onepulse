"use client";

import { memo } from "react";
import { ClaimFallbackUI } from "./claim-fallback-ui";
import type { ButtonState } from "./get-button-state";

type DegenActionButtonProps = {
  state: ButtonState;
};

export const DegenActionButton = memo(({ state }: DegenActionButtonProps) => {
  if (state.showFallback) {
    return <ClaimFallbackUI type={state.showFallback} />;
  }
  return null;
});
