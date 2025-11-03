"use client"

import { useCallback } from "react"
import { minikitConfig } from "@/minikit.config"
import { useMiniKit } from "@coinbase/onchainkit/minikit"
import { sdk } from "@farcaster/miniapp-sdk"
import { Bookmark } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"

interface HomeHeaderProps {
  isFrameReady: boolean
  inMiniApp: boolean
  onMiniAppAdded: () => void
}

export function HomeHeader({
  isFrameReady,
  inMiniApp,
  onMiniAppAdded,
}: HomeHeaderProps) {
  const { context } = useMiniKit()

  const handleAddMiniApp = useCallback(async () => {
    try {
      const response = await sdk.actions.addMiniApp()

      if (response.notificationDetails) {
        toast.success("Mini App added with notifications enabled!")
      } else {
        toast.success("Mini App added without notifications")
      }
      onMiniAppAdded()
    } catch (error) {
      toast.error(`Error: ${error}`)
    }
  }, [onMiniAppAdded])

  const showSaveButton =
    isFrameReady && inMiniApp && context?.client?.added !== true

  return (
    <div className="mt-3 mb-6 flex items-center justify-between">
      <div className="justify-left text-2xl font-bold">
        {minikitConfig.miniapp.name}
      </div>
      <div>
        {showSaveButton && (
          <Button
            variant={"outline"}
            size={"sm"}
            className="mr-2"
            onClick={handleAddMiniApp}
          >
            <Bookmark />
            Save
          </Button>
        )}
        <ModeToggle />
      </div>
    </div>
  )
}
