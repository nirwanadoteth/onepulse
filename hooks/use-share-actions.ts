"use client";

import { sdk } from "@farcaster/miniapp-sdk";
import { toast } from "sonner";
import { handleError } from "@/lib/error-handling";

type ShareActions = {
  shareToCast: (shareText: string, shareUrl: string) => Promise<void>;
  shareToClipboard: (shareText: string, shareUrl: string) => Promise<void>;
};

export function useShareActions(): ShareActions {
  const shareToCast = async (shareText: string, shareUrl: string) => {
    try {
      await sdk.actions.composeCast({
        text: shareText,
        embeds: [shareUrl],
      });
    } catch (error) {
      // Cast composition failure handled by copying to clipboard
      handleError(
        error,
        "Failed to compose cast",
        {
          operation: "share/compose-cast",
        },
        { silent: true }
      );
      try {
        if (!navigator.clipboard?.writeText) {
          toast.error("Clipboard not available");
          return;
        }
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        toast.success("Copied to clipboard");
      } catch (clipboardError) {
        handleError(
          clipboardError,
          "Failed to copy to clipboard",
          { operation: "share/copy-to-clipboard" },
          { silent: true }
        );
        toast.error("Copy failed");
      }
    }
  };

  const shareToClipboard = async (shareText: string, shareUrl: string) => {
    const fullText = `${shareText}\n${shareUrl}`;
    try {
      if (!navigator.clipboard?.writeText) {
        toast.error("Clipboard not available");
        return;
      }
      await navigator.clipboard.writeText(fullText);
      toast.success("Copied to clipboard");
    } catch (clipboardError) {
      handleError(
        clipboardError,
        "Failed to copy to clipboard",
        { operation: "share/copy-to-clipboard" },
        { silent: true }
      );
      toast.error("Copy failed");
    }
  };

  return {
    shareToCast,
    shareToClipboard,
  };
}
