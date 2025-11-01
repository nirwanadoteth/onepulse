import { NextResponse } from "next/server"
import { sendNotification } from "@/lib/notifications"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { targetFids, notification, filters } = body || {}

    if (!Array.isArray(targetFids) || targetFids.length === 0) {
      return NextResponse.json(
        { error: "targetFids must be a non-empty number array" },
        { status: 400 }
      )
    }
    if (!notification || typeof notification !== "object") {
      return NextResponse.json(
        { error: "notification object is required" },
        { status: 400 }
      )
    }

    const result = await sendNotification(targetFids, notification, filters)
    const status = result.success ? 200 : 500
    return NextResponse.json(result, { status })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
