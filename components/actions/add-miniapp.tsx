"use client"

import { useCallback, useState } from "react"
import { useAddFrame } from "@coinbase/onchainkit/minikit"
import { Button } from "~/components/ui/Button"

export function AddMiniAppAction() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  // Use MiniKit's useAddFrame hook
  const addFrame = useAddFrame()

  const handleAddFrame = useCallback(async (): Promise<void> => {
    setLoading(true)
    setError(null)
    setStatus(null)

    try {
      const notificationDetails = await addFrame()

      if (notificationDetails) {
        setStatus("Mini App added successfully! Notifications enabled.")
      } else {
        setError(
          "Failed to add Mini App - user may have cancelled or an error occurred"
        )
      }
    } catch (err) {
      setError(
        `Failed to add Mini App: ${err instanceof Error ? err.message : "Unknown error"}`
      )
    } finally {
      setLoading(false)
    }
  }, [addFrame])

  return (
    <div className="mb-4">
      <div className="my-2 rounded-lg bg-gray-100 p-2 dark:bg-gray-800">
        <pre className="font-mono text-xs text-emerald-500 dark:text-emerald-400">
          useAddFrame()
        </pre>
      </div>

      {error && (
        <div className="my-2 rounded-lg bg-red-50 p-2 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {status && (
        <div className="my-2 rounded-lg bg-green-50 p-2 text-xs text-green-600 dark:bg-green-900/20 dark:text-green-400">
          {status}
        </div>
      )}

      <Button onClick={handleAddFrame} disabled={loading} isLoading={loading}>
        Add Frame
      </Button>
    </div>
  )
}
