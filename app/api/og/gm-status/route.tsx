import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

function parseGMStatusParams(searchParams: URLSearchParams) {
  return {
    username: searchParams.get("username") || "Anonymous",
    streak: Number.parseInt(searchParams.get("streak") || "0", 10),
    totalGMs: Number.parseInt(searchParams.get("totalGMs") || "0", 10),
    chains: searchParams.get("chains")?.split(",") || [],
    todayGM: searchParams.get("todayGM") === "true",
    claimedToday: searchParams.get("claimedToday") === "true",
  };
}

function generateHeader(claimedToday: boolean) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        marginBottom: 20,
      }}
    >
      <div
        style={{
          fontSize: 48,
          fontWeight: 700,
          marginRight: 16,
        }}
      >
        {claimedToday ? "🏆" : "GM"}
      </div>
      <div
        style={{
          fontSize: 24,
          opacity: 0.9,
        }}
      >
        {claimedToday ? "Champion" : "Status"}
      </div>
    </div>
  );
}

function generateUsername(username: string) {
  return (
    <div
      style={{
        fontSize: 36,
        fontWeight: 500,
        marginBottom: 30,
        textAlign: "center",
      }}
    >
      {username}
    </div>
  );
}

function generateStatusGrid(
  streak: number,
  totalGMs: number,
  todayGM: boolean
) {
  return (
    <div
      style={{
        display: "flex",
        gap: 40,
        marginBottom: 30,
      }}
    >
      {/* Streak */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: streak > 0 ? "#ffd700" : "#ffffff",
          }}
        >
          {streak}
        </div>
        <div
          style={{
            fontSize: 16,
            opacity: 0.8,
          }}
        >
          Day Streak
        </div>
      </div>

      {/* Total GMs */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
          }}
        >
          {totalGMs}
        </div>
        <div
          style={{
            fontSize: 16,
            opacity: 0.8,
          }}
        >
          Total GMs
        </div>
      </div>

      {/* Today's Status */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: todayGM ? "#00ff00" : "#ff6b6b",
          }}
        >
          {todayGM ? "✓" : "✗"}
        </div>
        <div
          style={{
            fontSize: 16,
            opacity: 0.8,
          }}
        >
          Today
        </div>
      </div>
    </div>
  );
}

function generateChainsSection(chains: string[]) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginBottom: 20,
      }}
    >
      <div
        style={{
          fontSize: 18,
          opacity: 0.9,
          marginBottom: 10,
        }}
      >
        Active on:
      </div>
      <div
        style={{
          display: "flex",
          gap: 8,
        }}
      >
        {chains.map((chain) => (
          <div
            key={chain}
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              padding: "4px 12px",
              borderRadius: 20,
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            {chain}
          </div>
        ))}
      </div>
    </div>
  );
}

function generateFooter(claimedToday: boolean) {
  return (
    <div
      style={{
        fontSize: 16,
        opacity: 0.7,
        textAlign: "center",
        marginTop: 20,
      }}
    >
      {claimedToday ? "Daily DEGEN claimed • " : ""}Join the GM movement •
      OnePulse
    </div>
  );
}

function generateMainOGImage(params: ReturnType<typeof parseGMStatusParams>) {
  const { username, streak, totalGMs, chains, todayGM, claimedToday } = params;

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffffff",
        backgroundImage: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        fontSize: 32,
        fontWeight: 600,
        color: "white",
      }}
    >
      {generateHeader(claimedToday)}
      {generateUsername(username)}
      {generateStatusGrid(streak, totalGMs, todayGM)}
      {generateChainsSection(chains)}
      {generateFooter(claimedToday)}
    </div>
  );
}

function generateFallbackImage() {
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#667eea",
        fontSize: 32,
        fontWeight: 600,
        color: "white",
      }}
    >
      OnePulse - Daily GM Status
    </div>
  );
}

export function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = parseGMStatusParams(searchParams);

    return new ImageResponse(generateMainOGImage(params), {
      width: 1200,
      height: 630,
    });
  } catch {
    // OG image generation failed - returning fallback image
    return new ImageResponse(generateFallbackImage(), {
      width: 1200,
      height: 630,
    });
  }
}
