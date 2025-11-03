import { useEffect } from "react"
import { useMiniKit } from "@coinbase/onchainkit/minikit"

export function useFrameInitialization() {
  const { isFrameReady, setFrameReady } = useMiniKit()

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady()
    }
  }, [setFrameReady, isFrameReady])
}
