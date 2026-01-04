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
      "@radix-ui/react-alert-dialog",
      "@radix-ui/react-aspect-ratio",
      "@radix-ui/react-avatar",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-icons",
      "@radix-ui/react-label",
      "@radix-ui/react-popover",
      "@radix-ui/react-progress",
      "@radix-ui/react-scroll-area",
      "@radix-ui/react-select",
      "@radix-ui/react-separator",
      "@radix-ui/react-slot",
      "@radix-ui/react-tabs",
      "@radix-ui/react-toggle",
      "@radix-ui/react-tooltip",
      "@coinbase/onchainkit",
      "@farcaster/miniapp-sdk",
      "@farcaster/miniapp-wagmi-connector",
      "viem",
      "viem/actions",
      "viem/chains",
      "viem/ens",
      "viem/utils",
      "wagmi",
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
