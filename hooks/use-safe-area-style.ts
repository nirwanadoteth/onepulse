import { useMemo } from "react"
import { useMiniKit } from "@coinbase/onchainkit/minikit"

export function useSafeAreaStyle() {
  const { context } = useMiniKit()
  const insets = context?.client?.safeAreaInsets

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
