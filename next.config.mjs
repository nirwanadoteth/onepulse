// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
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
  reactCompiler: true,
  reactStrictMode: true,
};

export default nextConfig;
