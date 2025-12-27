"use client";

import { sdk } from "@farcaster/miniapp-sdk";
import { toast } from "sonner";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { handleError } from "@/lib/error-handling";

type ShareActions = {
  shareToCast: (shareText: string, shareUrl: string) => Promise<boolean>;
  shareToClipboard: (shareText: string, shareUrl: string) => void;
};

export function useShareActions(): ShareActions {
  const { copyToClipboard } = useCopyToClipboard({
    onCopyAction: () => toast.success("Copied to clipboard"),
  });

  const shareToCast = async (
    shareText: string,
    shareUrl: string
  ): Promise<boolean> => {
    try {
      const result = await sdk.actions.composeCast({
        text: shareText,
        embeds: [shareUrl],
      });
      // If result is undefined, user didn't cast (saved to draft or closed)
      return result !== undefined;
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
        copyToClipboard(`${shareText}\n${shareUrl}`);
        return false; // Failed to cast, fell back to clipboard
      } catch (clipboardError) {
        handleError(
          clipboardError,
          "Failed to copy to clipboard",
          { operation: "share/copy-to-clipboard" },
          { silent: true }
        );
        toast.error("Copy failed");
        return false;
      }
    }
  };

  const shareToClipboard = (shareText: string, shareUrl: string) => {
    const fullText = `${shareText}\n${shareUrl}`;
    try {
      copyToClipboard(fullText);
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
