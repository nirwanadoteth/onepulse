import { useCallback } from "react"

import { useOnboarding } from "@/hooks/use-onboarding"

export function useMiniAppFlow() {
  const { dismissOnboarding } = useOnboarding()

  const handleMiniAppAdded = useCallback(() => {
    dismissOnboarding()
  }, [dismissOnboarding])

  return { handleMiniAppAdded }
}
