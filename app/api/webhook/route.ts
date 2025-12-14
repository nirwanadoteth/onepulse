import {
  type MiniAppNotificationDetails,
  type MiniAppServerEvent,
  type ParseWebhookEvent,
  type ParseWebhookEventResult,
  parseWebhookEvent,
  verifyAppKeyWithNeynar,
} from "@farcaster/miniapp-node";
import type { NextRequest } from "next/server";
import { handleError } from "@/lib/error-handling";
import {
  deleteUserNotificationDetails,
  setUserNotificationDetails,
} from "@/lib/kv";
import { sendMiniAppNotification } from "@/lib/notifications";

function handleParseError(error: ParseWebhookEvent.ErrorType) {
  switch (error.name) {
    case "VerifyJsonFarcasterSignature.InvalidDataError":
    case "VerifyJsonFarcasterSignature.InvalidEventDataError":
      return Response.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    case "VerifyJsonFarcasterSignature.InvalidAppKeyError":
      return Response.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    case "VerifyJsonFarcasterSignature.VerifyAppKeyError":
      return Response.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    default:
      return Response.json(
        { success: false, error: "Unknown error" },
        { status: 500 }
      );
  }
}

async function handleMiniAppAdded(
  fid: number,
  appFid: number,
  notificationDetails: MiniAppNotificationDetails
) {
  if (notificationDetails) {
    await setUserNotificationDetails(fid, appFid, notificationDetails);
    await sendMiniAppNotification({
      fid,
      appFid,
      title: "Welcome to OnePulse",
      body: "Thank you for adding OnePulse",
    });
  } else {
    await deleteUserNotificationDetails(fid, appFid);
  }
}

async function handleNotificationsEnabled(
  fid: number,
  appFid: number,
  notificationDetails: MiniAppNotificationDetails
) {
  await setUserNotificationDetails(fid, appFid, notificationDetails);
  await sendMiniAppNotification({
    fid,
    appFid,
    title: "Ding ding ding",
    body: "Notifications are now enabled",
  });
}

async function processWebhookEvent(
  fid: number,
  appFid: number,
  event: MiniAppServerEvent
) {
  switch ((event as { event: string }).event) {
    case "miniapp_added":
      await handleMiniAppAdded(
        fid,
        appFid,
        (event as { notificationDetails: MiniAppNotificationDetails })
          .notificationDetails
      );
      break;
    case "miniapp_removed":
      await deleteUserNotificationDetails(fid, appFid);
      break;
    case "notifications_enabled":
      await handleNotificationsEnabled(
        fid,
        appFid,
        (event as { notificationDetails: MiniAppNotificationDetails })
          .notificationDetails
      );
      break;
    case "notifications_disabled":
      await deleteUserNotificationDetails(fid, appFid);
      break;
    default:
      // Ignore other events
      break;
  }
}

export async function POST(request: NextRequest) {
  const requestJson = await request.json();

  let data: ParseWebhookEventResult;
  try {
    data = await parseWebhookEvent(requestJson, verifyAppKeyWithNeynar);
  } catch (e: unknown) {
    const error = e as ParseWebhookEvent.ErrorType;
    return handleParseError(error);
  }

  const fid = data.fid;
  const appFid = data.appFid;
  const event = data.event;

  try {
    await processWebhookEvent(fid, appFid, event);
  } catch (error) {
    handleError(
      error,
      "Webhook processing failed",
      { operation: "webhook/process" },
      { silent: true }
    );
    return Response.json(
      { success: false, error: "Failed to process webhook" },
      { status: 500 }
    );
  }

  return Response.json({ success: true });
}
