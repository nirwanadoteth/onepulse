import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { sendMiniAppNotification } from "@/lib/notifications";

const notifyRequestSchema = z.object({
  fid: z.number().int().positive(),
  appFid: z.number().int().positive(),
  notification: z.object({
    title: z.string().min(1),
    body: z.string().min(1),
  }),
  notificationId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = notifyRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: parseResult.error.issues[0]?.message ?? "Invalid request body",
        },
        { status: 400 }
      );
    }

    const { fid, appFid, notification, notificationId } = parseResult.data;

    const result = await sendMiniAppNotification({
      fid,
      appFid,
      title: notification.title,
      body: notification.body,
      notificationId,
    });

    if (result.state === "error") {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 }
    );
  }
}
