"use client";

import { memo } from "react";
import { useCountdownValueLogic } from "./use-countdown-value-logic";

export const CountdownValue = memo(({ targetSec }: { targetSec: number }) => {
  const { text } = useCountdownValueLogic({ targetSec });

  return <span className="font-bold font-mono">{text}</span>;
});
