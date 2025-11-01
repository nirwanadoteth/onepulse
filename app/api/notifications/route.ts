import { NextResponse } from "next/server"

import { sendNotification } from "@/lib/notifications"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { targetFids, notification, filters } = body || {}

    // targetFids can be an empty array per Neynar docs. If provided, it must be an array of numbers.
    if (typeof targetFids !== "undefined" && !Array.isArray(targetFids)) {
      return NextResponse.json(
        { error: "targetFids must be an array when provided" },
        { status: 400 }
      )
    }
    if (
      Array.isArray(targetFids) &&
      !targetFids.every((v) => Number.isInteger(v))
    ) {
      return NextResponse.json(
        { error: "targetFids must contain only integers" },
        { status: 400 }
      )
    }
    if (!notification || typeof notification !== "object") {
      return NextResponse.json(
        { error: "notification object is required" },
        { status: 400 }
      )
    }

    // Normalize undefined to empty array so downstream call always gets an array.
    const normalizedTargetFids: number[] = Array.isArray(targetFids)
      ? targetFids
      : []
    const result = await sendNotification(
      normalizedTargetFids,
      notification,
      filters
    )
    const status = result.success ? 200 : 500
    return NextResponse.json(result, { status })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
