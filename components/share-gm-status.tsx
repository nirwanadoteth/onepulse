"use client";

import { Copy, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { cn } from "@/lib/utils";
import { useShareGMStatusLogic } from "./share-gm-status/use-share-gm-status-logic";
import { Button } from "./ui/button";

type ShareGMStatusProps = {
  className?: string;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  claimedToday?: boolean;
  completedAllChains?: boolean;
};

export function ShareGMStatus({
  className,
  variant = "outline",
  size = "default",
  claimedToday = false,
  completedAllChains = false,
}: ShareGMStatusProps) {
  const { isCopied, copyToClipboard } = useCopyToClipboard({
    onCopyAction: () => toast.success("Copied to clipboard"),
  });
  const { handleShare, shareText, shareUrl } = useShareGMStatusLogic(
    claimedToday,
    completedAllChains
  );

  const handleCopy = () => {
    const fullText = `${shareText}\n${shareUrl}`;
    copyToClipboard(fullText);
  };

  return (
    <div className={cn("flex gap-2", className)}>
      <Button
        className="flex-1 gap-2"
        onClick={() => handleShare("cast")}
        size={size}
        variant={variant}
      >
        <MessageCircle className="h-4 w-4" />
        Cast to Share
      </Button>
      <Button
        aria-label="Copy GM status"
        className="gap-2"
        onClick={handleCopy}
        size={size}
        variant={variant}
      >
        <Copy className={`h-4 w-4 ${isCopied ? "text-green-600" : ""}`} />
      </Button>
    </div>
  );
}
