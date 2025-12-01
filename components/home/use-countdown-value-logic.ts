import { useEffect, useState } from "react";

type UseCountdownValueLogicProps = {
  targetSec: number;
};

export const useCountdownValueLogic = ({
  targetSec,
}: UseCountdownValueLogicProps) => {
  const [text, setText] = useState("--:--:--");

  useEffect(() => {
    if (!targetSec) {
      return;
    }
    const format = (ms: number) => {
      const total = Math.max(0, Math.floor(ms / 1000));
      const h = Math.floor(total / 3600);
      const m = Math.floor((total % 3600) / 60);
      const s = total % 60;
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${pad(h)}:${pad(m)}:${pad(s)}`;
    };

    const update = () => {
      const now = Date.now();
      const diff = targetSec * 1000 - now;
      setText(format(diff));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [targetSec]);

  return { text };
};
