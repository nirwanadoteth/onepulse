import {
  SendNotificationRequest,
  sendNotificationResponseSchema,
} from "@farcaster/miniapp-sdk"

import { getUserNotificationDetails } from "@/lib/kv"

const appUrl = process.env.NEXT_PUBLIC_URL || ""

type sendMiniAppNotificationResult =
  | {
      state: "error"
      error: unknown
    }
  | { state: "no_token" }
  | { state: "rate_limit" }
  | { state: "success" }

export async function sendMiniAppNotification({
  fid,
  appFid,
  title,
  body,
}: {
  fid: number
  appFid: number
  title: string
  body: string
}): Promise<sendMiniAppNotificationResult> {
  const notificationDetails = await getUserNotificationDetails(fid, appFid)
  if (!notificationDetails) {
    return { state: "no_token" }
  }

  const response = await fetch(notificationDetails.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      notificationId: crypto.randomUUID(),
      title,
      body,
      targetUrl: appUrl,
      tokens: [notificationDetails.token],
    } satisfies SendNotificationRequest),
  })

  const responseJson = await response.json()

  if (response.status === 200) {
    const responseBody = sendNotificationResponseSchema.safeParse(responseJson)
    if (responseBody.success === false) {
      // Malformed response
      return { state: "error", error: responseBody.error.errors }
    }

    if (responseBody.data.result.rateLimitedTokens.length) {
      // Rate limited
      return { state: "rate_limit" }
    }

    return { state: "success" }
  } else {
    // Error response
    return { state: "error", error: responseJson }
  }
}
