// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  compress: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  poweredByHeader: false,
  reactCompiler: true,
  reactStrictMode: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  experimental: {
    inlineCss: true,
    optimizeCss: true,
    optimizeServerReact: true,
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-avatar",
      "@radix-ui/react-dialog",
      "@radix-ui/react-icons",
      "@radix-ui/react-label",
      "@radix-ui/react-popover",
      "@radix-ui/react-progress",
      "@radix-ui/react-separator",
      "@radix-ui/react-slot",
      "@radix-ui/react-tabs",
      "@coinbase/onchainkit",
      "@farcaster/miniapp-sdk",
      "@farcaster/miniapp-core",
      "@farcaster/miniapp-node",
      "@farcaster/miniapp-wagmi-connector",
      "viem",
      "viem/actions",
      "viem/chains",
      "viem/ens",
      "viem/utils",
      "viem/errors",
      "wagmi",
      "@wagmi/core",
      "@wagmi/connectors",
      "ox",
      "@adraffy/ens-normalize",
      "@noble/curves",
      "@noble/hashes",
    ],
  },
  serverExternalPackages: ["@solana/web3.js", "rpc-websockets", "tr46"],
  turbopack: {
    resolveAlias: {
      "wagmi/experimental": "wagmi",
    },
  },
};

export default nextConfig;
