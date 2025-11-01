import "server-only"

import { NeynarAPIClient } from "@neynar/nodejs-sdk"

type PublishParams = Parameters<NeynarAPIClient["publishFrameNotifications"]>[0]
type PublishNotification = PublishParams["notification"]
type PublishFilters = PublishParams["filters"]

let _client: NeynarAPIClient | null = null

function getClient() {
  if (_client) return _client
  const apiKey = process.env.NEYNAR_API_KEY
  if (!apiKey) {
    throw new Error("NEYNAR_API_KEY environment variable is required")
  }
  _client = new NeynarAPIClient({ apiKey })
  return _client
}

export async function sendNotification(
  targetFids: number[],
  notification: PublishNotification,
  filters?: PublishFilters
) {
  try {
    const client = getClient()
    const response = await client.publishFrameNotifications({
      targetFids,
      filters,
      notification,
    })

    return {
      success: true,
      data: response,
    }
  } catch (error) {
    console.error("Failed to send notification:", error)
    const message = error instanceof Error ? error.message : String(error)
    return {
      success: false,
      error: message,
    }
  }
}
