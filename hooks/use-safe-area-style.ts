import { useMemo } from "react"

import { useMiniAppContext } from "@/components/providers/miniapp-provider"

export function useSafeAreaStyle() {
  const miniAppContext = useMiniAppContext()
  const insets = miniAppContext?.context?.client.safeAreaInsets

  return useMemo(
    () => ({
      marginTop: insets?.top ?? 0,
      marginBottom: insets?.bottom ?? 0,
      marginLeft: insets?.left ?? 0,
      marginRight: insets?.right ?? 0,
    }),
    [insets]
  )
}
