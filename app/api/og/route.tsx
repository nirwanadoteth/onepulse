import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

function parseGMStatusParams(searchParams: URLSearchParams) {
  const chainsParam = searchParams.get("chains");
  const chains = chainsParam
    ? chainsParam.split(",").map((c) => {
        const [name, count] = c.split(":");
        return {
          name: name || "Unknown",
          count: Number.parseInt(count || "0", 10),
        };
      })
    : [];

  return {
    displayName: searchParams.get("displayName") || "name",
    username: searchParams.get("username") || "username",
    pfp: searchParams.get("pfp") || null,
    chains,
  };
}

function generateProfileSection(
  displayName: string,
  username: string,
  pfp: string | null
) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 24,
        top: 40,
      }}
    >
      {pfp ? (
        // biome-ignore lint: OG image generation requires img for next/og
        <img
          alt="Profile"
          height={160}
          src={pfp}
          style={{
            borderRadius: "50%",
            objectFit: "cover",
            boxShadow:
              "0 0 0 4px rgba(255,255,255,0.1), 0 20px 40px rgba(0,0,0,0.4)",
          }}
          width={160}
        />
      ) : (
        <div
          style={{
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 72,
            boxShadow:
              "0 0 0 4px rgba(255,255,255,0.1), 0 20px 40px rgba(0,0,0,0.4)",
            color: "white",
          }}
        >
          {displayName.charAt(0).toUpperCase()}
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 56,
            fontWeight: 800,
            letterSpacing: -1,
            color: "#0f172a",
            textAlign: "center",
            lineHeight: 1.1,
          }}
        >
          {displayName}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 28,
            fontWeight: 500,
            color: "#64748b",
            textAlign: "center",
          }}
        >
          @{username}
        </div>
      </div>
    </div>
  );
}

const CHAIN_COLORS: Record<string, { bg: string; border: string }> = {
  base: { bg: "rgba(0, 82, 255, 0.1)", border: "rgba(0, 82, 255, 0.5)" },
  celo: { bg: "rgba(53, 208, 127, 0.1)", border: "rgba(53, 208, 127, 0.5)" },
  optimism: { bg: "rgba(255, 4, 32, 0.1)", border: "rgba(255, 4, 32, 0.5)" },
};

function generateGmStats(chains: { name: string; count: number }[]) {
  const stats = chains.map((chain) => {
    const colors = CHAIN_COLORS[chain.name.toLowerCase()] || {
      bg: "rgba(0, 0, 0, 0.1)",
      border: "rgba(0, 0, 0, 0.5)",
    };
    return {
      ...chain,
      ...colors,
    };
  });

  return (
    <div
      style={{
        display: "flex",
        gap: 24,
        marginTop: 56,
        width: "100%",
        justifyContent: "center",
      }}
    >
      {stats.map((chain) => (
        <div
          key={chain.name}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px 32px",
            borderRadius: 24,
            background: chain.bg,
            border: `1px solid ${chain.border}`,
            minWidth: 200,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 48,
              fontWeight: 800,
              lineHeight: 1,
              marginBottom: 8,
            }}
          >
            {chain.count}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 20,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            {chain.name}
          </div>
        </div>
      ))}
    </div>
  );
}

function generateMainOGImage(params: ReturnType<typeof parseGMStatusParams>) {
  const { displayName, username, pfp, chains } = params;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
        fontFamily:
          "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: 1080,
          height: 540,
          borderRadius: 40,
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)",
          padding: 48,
          position: "relative",
        }}
      >
        {/* Header Label */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 24,
            fontSize: 16,
            fontWeight: 600,
            color: "#64748b",
            textTransform: "uppercase",
            letterSpacing: 2,
            background: "#e2e8f0",
            padding: "6px 16px",
            borderRadius: 100,
          }}
        >
          Daily GM Status
        </div>

        {generateProfileSection(displayName, username, pfp)}
        {generateGmStats(chains)}
      </div>
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
        background: "#ffffff",
        fontSize: 48,
        fontWeight: 800,
        fontFamily: "sans-serif",
        color: "#0f172a",
        letterSpacing: -1,
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
