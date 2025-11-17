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
  {
    key: "x-xss-protection",
    value: "1; mode=block",
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
  webpack: (config) => {
    config.externals.push("pino-pretty");
    return config;
  },
  serverExternalPackages: ["pino-pretty"],
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
