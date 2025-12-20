import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { isAddress } from "viem";
import { z } from "zod";
import { SUPPORTED_CHAINS } from "@/lib/constants";
import { handleError } from "@/lib/error-handling";
import { fetchFarcasterUser } from "@/lib/farcaster";
import { getCachedGoogleFont, setCachedGoogleFont } from "@/lib/kv";
import { getGmRows } from "@/lib/spacetimedb/server-connection";

const RES_REGEXP =
  /src: url\((.+)\) format\('(opentype|truetype|woff|woff2)'\)/g;

const ogQuerySchema = z.object({
  address: z
    .string()
    .refine((addr) => isAddress(addr), { message: "Invalid Ethereum address" })
    .nullish(),
});

// Formats supported by Satori/next/og, in order of preference
// WOFF2 is excluded because next/og does not support it (use WOFF instead)
const SUPPORTED_FONT_FORMATS = ["woff", "opentype", "truetype"] as const;

const FONT_CSS_TIMEOUT_MS = 3000;
const FONT_FILE_TIMEOUT_MS = 5000;

type SupportedFontFormat = (typeof SUPPORTED_FONT_FORMATS)[number];

/**
 * Parse all available font formats from Google Fonts CSS and return the first supported one.
 * Preference order: woff > opentype > truetype (avoids woff2 which next/og doesn't support)
 */
function findSupportedFontUrl(
  css: string
): { url: string; format: SupportedFontFormat } | null {
  const matches = Array.from(css.matchAll(RES_REGEXP));

  // Group all matches by format
  const formatMap = new Map<string, string>();
  for (const match of matches) {
    const url = match[1];
    const format = match[2];
    if (url && format && !formatMap.has(format)) {
      formatMap.set(format, url);
    }
  }

  // Select the first supported format in preference order
  for (const preferredFormat of SUPPORTED_FONT_FORMATS) {
    const url = formatMap.get(preferredFormat);
    if (url) {
      return { url, format: preferredFormat };
    }
  }

  return null;
}

// In-memory cache for fonts (survives across requests in the same serverless instance)
const fontMemoryCache = new Map<string, ArrayBuffer>();

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(buffer).toString("base64");
  }
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i += 1024) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 1024));
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  if (typeof Buffer !== "undefined") {
    const buf = Buffer.from(base64, "base64");
    return buf.buffer.slice(
      buf.byteOffset,
      buf.byteOffset + buf.byteLength
    ) as ArrayBuffer;
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer as ArrayBuffer;
}

async function loadGoogleFont(
  font: string,
  weight: number
): Promise<ArrayBuffer> {
  const cacheKey = `${font}:${weight}`;

  // Check in-memory cache first (fastest, no I/O)
  const memCached = fontMemoryCache.get(cacheKey);
  if (memCached) {
    return memCached;
  }

  // Check Redis cache second
  const cached = await getCachedGoogleFont(font, weight);
  if (cached) {
    const buffer = base64ToArrayBuffer(cached);
    fontMemoryCache.set(cacheKey, buffer);
    return buffer;
  }

  // Fetch from Google Fonts
  const url = `https://fonts.googleapis.com/css2?family=${font}:wght@${weight}`;

  let css: string;
  const cssController = new AbortController();
  const cssTimeout = setTimeout(
    () => cssController.abort(),
    FONT_CSS_TIMEOUT_MS
  );
  try {
    const res = await fetch(url, { signal: cssController.signal });
    if (!res.ok) {
      throw new Error("Failed to fetch font CSS");
    }
    css = await res.text();
  } finally {
    clearTimeout(cssTimeout);
  }

  // Parse CSS and find the first supported font format
  const fontResource = findSupportedFontUrl(css);

  if (fontResource) {
    const { url: fontUrl, format } = fontResource;

    let fontBuffer: ArrayBuffer;
    const fontController = new AbortController();
    const fontTimeout = setTimeout(
      () => fontController.abort(),
      FONT_FILE_TIMEOUT_MS
    );
    try {
      const res = await fetch(fontUrl, { signal: fontController.signal });
      if (!res.ok) {
        throw new Error(`Failed to fetch font file (${format})`);
      }
      fontBuffer = await res.arrayBuffer();
    } finally {
      clearTimeout(fontTimeout);
    }

    // Cache in memory and Redis
    fontMemoryCache.set(cacheKey, fontBuffer);
    await setCachedGoogleFont(font, weight, arrayBufferToBase64(fontBuffer));

    return fontBuffer;
  }

  throw new Error("Failed to load font");
}

function getChainName(chainId: number): string {
  return SUPPORTED_CHAINS.find((c) => c.id === chainId)?.name || "Unknown";
}

function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

async function getDataFromAddress(address: string): Promise<GMStatusParams> {
  let displayName = formatAddress(address);
  let username = formatAddress(address);
  let pfp: string | null = null;
  let stats: {
    name: string;
    currentStreak: number;
    highestStreak: number;
    allTimeGmCount: number;
  }[] = [];

  try {
    const rows = await getGmRows(address);

    // Process chains using keyed structure
    const gmStats: Record<
      string,
      {
        name: string;
        currentStreak: number;
        highestStreak: number;
        allTimeGmCount: number;
      }
    > = {};
    for (const r of rows) {
      gmStats[String(r.chainId)] = {
        name: getChainName(r.chainId),
        currentStreak: r.currentStreak ?? 0,
        highestStreak: r.highestStreak ?? 0,
        allTimeGmCount: r.allTimeGmCount ?? 0,
      };
    }

    // Convert to sorted chains array for OG image
    stats = Object.values(gmStats).sort((a, b) => a.name.localeCompare(b.name));

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
    handleError(
      error,
      "Error fetching GM stats for OG",
      {
        operation: "og/fetch-gm-stats",
      },
      { silent: true }
    );
  }

  return {
    displayName,
    username,
    pfp,
    stats,
  };
}

type GMStatusParams = {
  displayName: string;
  username: string;
  pfp: string | null;
  stats: {
    name: string;
    currentStreak: number;
    highestStreak: number;
    allTimeGmCount: number;
  }[];
};

async function fetchGMStatusParams(
  searchParams: URLSearchParams
): Promise<GMStatusParams> {
  const address = searchParams.get("address");

  // If address is provided, fetch data from SpacetimeDB and Farcaster
  if (address && isAddress(address)) {
    return await getDataFromAddress(address);
  }

  // Fallback to empty stats
  const stats: GMStatusParams["stats"] = [];

  return {
    displayName: searchParams.get("displayName") || "name",
    username: searchParams.get("username") || "username",
    pfp: searchParams.get("pfp") || null,
    stats,
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
        justifyContent: "center",
        gap: 24,
        padding: "0 60px",
      }}
    >
      {pfp ? (
        // biome-ignore lint: OG image generation requires img for next/og
        <img
          alt="Profile"
          height={180}
          src={pfp}
          style={{
            borderRadius: "50%",
            objectFit: "cover",
            boxShadow: "0 0 0 6px rgba(255,255,255,0.1)",
          }}
          width={180}
        />
      ) : (
        <div
          style={{
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 72,
            boxShadow: "0 0 0 6px rgba(255,255,255,0.1)",
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
          gap: 6,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 48,
            fontWeight: 800,
            letterSpacing: -1,
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
            fontSize: 24,
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

function generateGmStatsTable(
  stats: {
    name: string;
    currentStreak: number;
    highestStreak: number;
    allTimeGmCount: number;
  }[]
) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "32px",
        borderRadius: 24,
        background: "rgba(255, 255, 255, 0.03)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      {/* Table Header */}
      <div
        style={{
          display: "flex",
          paddingBottom: 16,
          borderBottom: "2px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 140,
            fontSize: 18,
            fontWeight: 700,
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Chain
        </div>
        <div
          style={{
            display: "flex",
            width: 120,
            fontSize: 18,
            fontWeight: 700,
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: 1,
            justifyContent: "center",
          }}
        >
          Current
        </div>
        <div
          style={{
            display: "flex",
            width: 120,
            fontSize: 18,
            fontWeight: 700,
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: 1,
            justifyContent: "center",
          }}
        >
          Highest
        </div>
        <div
          style={{
            display: "flex",
            width: 120,
            fontSize: 18,
            fontWeight: 700,
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: 1,
            justifyContent: "center",
          }}
        >
          All-Time
        </div>
      </div>

      {/* Table Rows */}
      {stats.map((chain, index) => {
        const colors = CHAIN_COLORS[chain.name.toLowerCase()] || {
          bg: "rgba(255, 255, 255, 0.05)",
          border: "rgba(255, 255, 255, 0.1)",
          text: "#ffffff",
        };

        return (
          <div
            key={chain.name}
            style={{
              display: "flex",
              paddingTop: 20,
              paddingBottom: 20,
              borderBottom:
                index < stats.length - 1
                  ? "1px solid rgba(255, 255, 255, 0.05)"
                  : "none",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                width: 140,
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: colors.bg,
                }}
              />
              <div
                style={{
                  display: "flex",
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#ffffff",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                {chain.name}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                width: 120,
                fontSize: 32,
                fontWeight: 800,
                color: "#ffffff",
                justifyContent: "center",
              }}
            >
              {chain.currentStreak}
            </div>
            <div
              style={{
                display: "flex",
                width: 120,
                fontSize: 32,
                fontWeight: 800,
                color: "#ffffff",
                justifyContent: "center",
              }}
            >
              {chain.highestStreak}
            </div>
            <div
              style={{
                display: "flex",
                width: 120,
                fontSize: 32,
                fontWeight: 800,
                color: "#ffffff",
                justifyContent: "center",
              }}
            >
              {chain.allTimeGmCount}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function generateMainOGImage(
  params: Awaited<ReturnType<typeof fetchGMStatusParams>>
) {
  const { displayName, username, pfp, stats } = params;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "80px",
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
          left: 80,
          fontSize: 24,
          fontWeight: 600,
          color: "#a1a1a1",
          letterSpacing: 4,
          textTransform: "uppercase",
        }}
      >
        OnePulse
      </div>

      {/* Left: Profile */}
      <div
        style={{
          display: "flex",
          flex: "0 0 auto",
        }}
      >
        {generateProfileSection(displayName, username, pfp)}
      </div>

      {/* Right: Stats Table */}
      <div
        style={{
          display: "flex",
          flex: "1 1 auto",
          justifyContent: "flex-end",
          paddingLeft: 60,
        }}
      >
        {generateGmStatsTable(stats)}
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const parseResult = ogQuerySchema.safeParse({
      address: searchParams.get("address"),
      chains: searchParams.get("chains"),
      displayName: searchParams.get("displayName"),
      username: searchParams.get("username"),
      pfp: searchParams.get("pfp"),
    });

    if (!parseResult.success) {
      handleError(
        new Error(parseResult.error.issues[0]?.message ?? "Invalid parameters"),
        "OG query validation failed",
        { operation: "og/validate-query" },
        { silent: true }
      );
      return new ImageResponse(generateFallbackImage(), {
        width: 1200,
        height: 800,
      });
    }

    const validParams = parseResult.data;
    const ogSearchParams = new URLSearchParams();
    if (validParams.address) {
      ogSearchParams.set("address", validParams.address);
    }

    // Load fonts and fetch params in parallel to reduce I/O wait time
    const [params, geistMedium, geistSemiBold, geistBold] = await Promise.all([
      fetchGMStatusParams(ogSearchParams),
      loadGoogleFont("Geist", 500),
      loadGoogleFont("Geist", 600),
      loadGoogleFont("Geist", 800),
    ]);

    const imageResponse = new ImageResponse(generateMainOGImage(params), {
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

    // Add cache headers - cache for 5 minutes, stale-while-revalidate for 1 hour
    imageResponse.headers.set(
      "Cache-Control",
      "public, max-age=300, stale-while-revalidate=3600"
    );

    return imageResponse;
  } catch (error) {
    handleError(
      error,
      "OG image generation failed",
      { operation: "og/generate-image" },
      { silent: true }
    );
    return new ImageResponse(generateFallbackImage(), {
      width: 1200,
      height: 800,
    });
  }
}
