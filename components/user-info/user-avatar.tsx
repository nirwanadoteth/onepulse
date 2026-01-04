"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function UserAvatar({
  url: avatarUrl,
  name: displayName,
  isConnected,
}: {
  url: string | undefined;
  name: string;
  isConnected: boolean;
}) {
  if (!isConnected) {
    return (
      <Avatar className="size-8">
        <AvatarImage alt={displayName} src={avatarUrl} />
        <AvatarFallback className="text-xs">
          {displayName.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
    );
  }

  return (
    <Avatar className="size-8">
      <AvatarImage alt={displayName} src={avatarUrl} />
      <AvatarFallback className="text-xs">
        {displayName.slice(0, 2).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}
