import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { isAddress } from "viem";
import { SUPPORTED_CHAINS } from "@/lib/constants";
import { fetchFarcasterUser } from "@/lib/farcaster";
import { getGmRows } from "@/lib/spacetimedb/server-connection";

const RES_REGEXP = /src: url\((.+)\) format\('(opentype|truetype)'\)/;

async function loadGoogleFont(font: string, weight: number) {
  const url = `https://fonts.googleapis.com/css2?family=${font}:wght@${weight}`;
  const css = await fetch(url).then((res) => res.text());
  const resource = css.match(RES_REGEXP);

  if (resource) {
    if (!resource[1]) {
      throw new Error("Font URL not found in CSS");
    }
    return fetch(resource[1]).then((res) => res.arrayBuffer());
  }

  throw new Error("Failed to load font");
}

function getChainName(chainId: number): string {
  return SUPPORTED_CHAINS.find((c) => c.id === chainId)?.name || "Unknown";
}

function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

async function getDataFromAddress(address: string) {
  let displayName = formatAddress(address);
  let username = formatAddress(address);
  let pfp: string | null = null;
  let chains: { name: string; count: number }[] = [];

  try {
    const rows = await getGmRows(address);

    // Process chains
    chains = rows
      .map((r) => ({
        name: getChainName(r.chainId),
        count: r.allTimeGmCount ?? 0,
      }))
      .filter((c) => c.count > 0)
      .sort((a, b) => a.name.localeCompare(b.name));

    // Find FID and fetch Farcaster profile
    const fid = rows.find((r) => r.fid)?.fid;
    if (fid) {
      const fcUser = await fetchFarcasterUser(Number(fid));
      if (fcUser) {
        displayName = fcUser.displayName || fcUser.username || displayName;
        username = fcUser.username || username;
        pfp = fcUser.pfp.url || null;
      }
    }
  } catch (error) {
    console.error("Error fetching GM stats for OG:", error);
  }

  return {
    displayName,
    username,
    pfp,
    chains,
  };
}

async function fetchGMStatusParams(searchParams: URLSearchParams) {
  const address = searchParams.get("address");
  const chainsParam = searchParams.get("chains");

  // If address is provided, fetch data from SpacetimeDB and Farcaster
  if (address && isAddress(address)) {
    return await getDataFromAddress(address);
  }

  // Fallback to legacy parameter format
  const chains = chainsParam
    ? chainsParam.split(",").map((c) => {
        const [name, count] = c.split(":");
        return {
          name: name ? decodeURIComponent(name) : "Unknown",
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
        gap: 32,
      }}
    >
      {pfp ? (
        // biome-ignore lint: OG image generation requires img for next/og
        <img
          alt="Profile"
          height={200}
          src={pfp}
          style={{
            borderRadius: "50%",
            objectFit: "cover",
            boxShadow: "0 0 0 8px rgba(255,255,255,0.1)",
          }}
          width={200}
        />
      ) : (
        <div
          style={{
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 80,
            boxShadow: "0 0 0 8px rgba(255,255,255,0.1)",
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
          gap: 8,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 800,
            letterSpacing: -2,
            color: "#ffffff",
            textAlign: "center",
            lineHeight: 1,
          }}
        >
          {displayName}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 32,
            fontWeight: 500,
            color: "#94a3b8",
            textAlign: "center",
          }}
        >
          @{username}
        </div>
      </div>
    </div>
  );
}

const CHAIN_COLORS: Record<
  string,
  { bg: string; border: string; text: string }
> = {
  base: {
    bg: "rgba(0, 0, 255, 1)",
    border: "rgba(0, 0, 255, 0.3)",
    text: "#0a0a0a",
  },
  celo: {
    bg: "rgba(252, 255, 82, 1)",
    border: "rgba(252, 255, 82, 0.3)",
    text: "#0a0a0a",
  },
  optimism: {
    bg: "rgba(255, 4, 32, 1)",
    border: "rgba(255, 4, 32, 0.3)",
    text: "#0a0a0a",
  },
};

function generateGmStats(chains: { name: string; count: number }[]) {
  const stats = chains.map((chain) => {
    const colors = CHAIN_COLORS[chain.name.toLowerCase()] || {
      bg: "rgba(255, 255, 255, 0.05)",
      border: "rgba(255, 255, 255, 0.1)",
      text: "#0a0a0a",
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
        gap: 32,
        marginTop: 64,
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
            padding: "32px 48px",
            borderRadius: 32,
            background: chain.bg,
            border: `1px solid ${chain.border}`,
            minWidth: 240,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 64,
              fontWeight: 800,
              lineHeight: 1,
              marginBottom: 12,
              color: "#0a0a0a",
            }}
          >
            {chain.count}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 24,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: 2,
              color: chain.text,
            }}
          >
            {chain.name}
          </div>
        </div>
      ))}
    </div>
  );
}

function generateMainOGImage(
  params: Awaited<ReturnType<typeof fetchGMStatusParams>>
) {
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
        background: "#0a0a0a",
        backgroundImage:
          "radial-gradient(circle at 50% 0%, #171717 0%, #0a0a0a 100%)",
        fontFamily: "Geist, sans-serif",
        color: "white",
      }}
    >
      {/* Watermark */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          fontSize: 24,
          fontWeight: 600,
          color: "#a1a1a1",
          letterSpacing: 4,
          textTransform: "uppercase",
        }}
      >
        OnePulse
      </div>

      {generateProfileSection(displayName, username, pfp)}
      {generateGmStats(chains)}
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = await fetchGMStatusParams(searchParams);

    const geistMedium = await loadGoogleFont("Geist", 500);
    const geistSemiBold = await loadGoogleFont("Geist", 600);
    const geistBold = await loadGoogleFont("Geist", 800);

    return new ImageResponse(generateMainOGImage(params), {
      width: 1200,
      height: 800,
      fonts: [
        {
          name: "Geist",
          data: geistMedium,
          style: "normal",
          weight: 500,
        },
        {
          name: "Geist",
          data: geistSemiBold,
          style: "normal",
          weight: 600,
        },
        {
          name: "Geist",
          data: geistBold,
          style: "normal",
          weight: 800,
        },
      ],
    });
  } catch {
    // OG image generation failed - returning fallback image
    return new ImageResponse(generateFallbackImage(), {
      width: 1200,
      height: 800,
    });
  }
}
