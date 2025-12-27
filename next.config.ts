import type { NextConfig } from "next";

const securityHeaders = [
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
  experimental: {
    inlineCss: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  poweredByHeader: false,
  reactStrictMode: true,
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
