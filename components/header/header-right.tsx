"use client";

import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeaderRight() {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        className="group/toggle extend-touch-target size-8"
        onClick={handleReload}
        size="icon"
        title="Reload"
        variant="outline"
      >
        <RefreshCcw className="size-4.5" />
        <span className="sr-only">Reload</span>
      </Button>
    </div>
  );
}
