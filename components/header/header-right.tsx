import { Bookmark, Settings, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { memo } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";

type HeaderRightProps = {
  showSaveButton: boolean;
  showShareButton: boolean;
  showAdminButton: boolean;
  onSaveClick: () => void;
  onShareClick: () => void;
};

export const HeaderRight = memo(
  ({
    showSaveButton,
    showShareButton,
    showAdminButton,
    onSaveClick,
    onShareClick,
  }: HeaderRightProps) => {
    const router = useRouter();

    const handleAdminClick = () => {
      router.push("/admin");
    };

    return (
      <div className="flex items-center gap-1">
        {showShareButton && (
          <Button
            className="group/toggle extend-touch-target size-8"
            onClick={onShareClick}
            size="icon"
            title="Share"
            variant="ghost"
          >
            <Share2 className="size-4.5" />
            <span className="sr-only">Share</span>
          </Button>
        )}
        {showSaveButton && (
          <Button
            className="group/toggle extend-touch-target size-8"
            onClick={onSaveClick}
            size="icon"
            title="Save"
            variant="ghost"
          >
            <Bookmark className="size-4.5" />
            <span className="sr-only">Save</span>
          </Button>
        )}
        {showAdminButton && (
          <Button
            className="group/toggle extend-touch-target size-8"
            onClick={handleAdminClick}
            size="icon"
            title="Admin"
            variant="ghost"
          >
            <Settings className="size-4.5" />
            <span className="sr-only">Admin</span>
          </Button>
        )}
        <ModeToggle />
      </div>
    );
  }
);
