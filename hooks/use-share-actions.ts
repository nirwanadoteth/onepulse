import { sdk } from "@farcaster/miniapp-sdk";
import { toast } from "sonner";

export function useShareActions() {
  const shareToCast = async (shareText: string, shareUrl: string) => {
    try {
      await sdk.actions.composeCast({
        text: shareText,
        embeds: [shareUrl],
      });
    } catch (error) {
      // Cast composition failure handled by copying to clipboard
      console.error("Failed to compose cast:", error);
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      toast.success("Copied to clipboard");
    }
  };

  const shareToClipboard = (shareText: string, shareUrl: string) => {
    const fullText = `${shareText}\n${shareUrl}`;
    navigator.clipboard.writeText(fullText);
    toast.success("Copied to clipboard");
  };

  return {
    shareToCast,
    shareToClipboard,
  };
}
