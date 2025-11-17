import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "cache-control",
    value: "no-cache",
  },
  {
    key: "cross-origin-opener-policy",
    value: "same-origin-allow-popups",
  },
  {
    key: "referrer-policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "strict-transport-security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "x-content-type-options",
    value: "nosniff",
  },
];

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    inlineCss: true,
  },
  transpilePackages: ["spacetimedb"],
  serverExternalPackages: ["pino-pretty"],
  // biome-ignore lint/suspicious/useAwait: This is a valid async function
  async headers() {
    return [
      {
        source: "/:path*",
        basePath: false,
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
