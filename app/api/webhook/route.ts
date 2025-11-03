import { NextRequest } from "next/server"
import {
  ParseWebhookEvent,
  parseWebhookEvent,
  verifyAppKeyWithNeynar,
} from "@farcaster/miniapp-node"

import {
  deleteUserNotificationDetails,
  setUserNotificationDetails,
} from "@/lib/kv"
import { sendMiniAppNotification } from "@/lib/notifications"

function handleParseError(error: ParseWebhookEvent.ErrorType) {
  switch (error.name) {
    case "VerifyJsonFarcasterSignature.InvalidDataError":
    case "VerifyJsonFarcasterSignature.InvalidEventDataError":
      return Response.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    case "VerifyJsonFarcasterSignature.InvalidAppKeyError":
      return Response.json(
        { success: false, error: error.message },
        { status: 401 }
      )
    case "VerifyJsonFarcasterSignature.VerifyAppKeyError":
      return Response.json(
        { success: false, error: error.message },
        { status: 500 }
      )
  }
}

async function handleMiniAppAdded(
  fid: number,
  appFid: number,
  notificationDetails: unknown
) {
  if (notificationDetails) {
    await setUserNotificationDetails(
      fid,
      appFid,
      notificationDetails as { url: string; token: string }
    )
    await sendMiniAppNotification({
      fid,
      appFid,
      title: "Welcome to OnePulse",
      body: "Thank you for adding OnePulse",
    })
  } else {
    await deleteUserNotificationDetails(fid, appFid)
  }
}

async function handleNotificationsEnabled(
  fid: number,
  appFid: number,
  notificationDetails: unknown
) {
  await setUserNotificationDetails(
    fid,
    appFid,
    notificationDetails as { url: string; token: string }
  )
  await sendMiniAppNotification({
    fid,
    appFid,
    title: "Ding ding ding",
    body: "Notifications are now enabled",
  })
}

async function processWebhookEvent(
  fid: number,
  appFid: number,
  event: unknown
) {
  switch ((event as { event: string }).event) {
    case "miniapp_added":
      await handleMiniAppAdded(
        fid,
        appFid,
        (event as { notificationDetails: unknown }).notificationDetails
      )
      break
    case "miniapp_removed":
      await deleteUserNotificationDetails(fid, appFid)
      break
    case "notifications_enabled":
      await handleNotificationsEnabled(
        fid,
        appFid,
        (event as { notificationDetails: unknown }).notificationDetails
      )
      break
    case "notifications_disabled":
      await deleteUserNotificationDetails(fid, appFid)
      break
  }
}

export async function POST(request: NextRequest) {
  const requestJson = await request.json()

  let data
  try {
    data = await parseWebhookEvent(requestJson, verifyAppKeyWithNeynar)
  } catch (e: unknown) {
    const error = e as ParseWebhookEvent.ErrorType
    return handleParseError(error)
  }

  const fid = data.fid
  const appFid = data.appFid
  const event = data.event

  await processWebhookEvent(fid, appFid, event)

  return Response.json({ success: true })
}
