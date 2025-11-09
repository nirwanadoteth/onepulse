"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

type CountdownTextProps = {
  targetSec: number;
};

export const CountdownText = React.memo(({ targetSec }: CountdownTextProps) => {
  const [text, setText] = useState("GM in --:--:--");
  const rafRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  const format = useCallback((ms: number) => {
    const total = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const pad = (n: number) => String(n).padStart(2, "0");
    return `GM in ${pad(h)}:${pad(m)}:${pad(s)}`;
  }, []);

  useEffect(() => {
    if (!targetSec) {
      return;
    }

    const update = () => {
      const nowSec = Math.floor(Date.now() / 1000);
      const ms = Math.max(0, (targetSec - nowSec) * 1000);
      setText(format(ms));
    };

    // Align the first paint, then tick every second
    rafRef.current = window.requestAnimationFrame(() => update());
    intervalRef.current = window.setInterval(update, 1000);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [targetSec, format]);

  return <>{text}</>;
});
