import { useEffect, useState } from "react"
import { sdk } from "@farcaster/miniapp-sdk"
import { useAccount } from "wagmi"

import { detectCoinbaseSmartWallet } from "@/lib/utils"

export function usePageState() {
  const { address, isConnected } = useAccount()
  const [isSmartWallet, setIsSmartWallet] = useState(false)
  const [inMiniApp, setInMiniApp] = useState(false)

  useEffect(() => {
    if (!isConnected || !address) return
    ;(async () => {
      const result = await detectCoinbaseSmartWallet(address as `0x${string}`)
      setIsSmartWallet(result)
    })()
  }, [isConnected, address])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const result = await sdk.isInMiniApp()
        if (!cancelled) setInMiniApp(Boolean(result))
      } catch {
        if (!cancelled) setInMiniApp(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return { isSmartWallet, inMiniApp, isConnected, address }
}
