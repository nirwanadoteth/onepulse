"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"

type MiniAppUser = {
  fid: number
  displayName: string
  username: string
  pfpUrl?: string
}

export function Profile({ user }: { user?: MiniAppUser }) {
  return (
    <div className="mt-4 space-y-4">
      {user && (
        <Item variant="outline">
          <ItemMedia>
            <Avatar className="size-16">
              <AvatarImage src={user.pfpUrl} alt={user.displayName} />
              <AvatarFallback>User</AvatarFallback>
            </Avatar>
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{user.displayName}</ItemTitle>
            <ItemDescription>@{user.username}</ItemDescription>
            <ItemDescription>FID: {user.fid}</ItemDescription>
          </ItemContent>
        </Item>
      )}
    </div>
  )
}
