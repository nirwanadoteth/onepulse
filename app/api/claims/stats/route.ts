import { NextResponse } from "next/server";
import { getDailyClaimsCount } from "@/lib/kv";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const count = await getDailyClaimsCount();
    const response = NextResponse.json({ count });
    // Cache for 10 seconds to reduce repeated calls
    response.headers.set("Cache-Control", "public, max-age=10");
    return response;
  } catch (error) {
    console.error("Error fetching claim stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch claim stats" },
      { status: 500 }
    );
  }
}
