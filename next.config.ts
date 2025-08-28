import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: undefined,
  },
  // Disable static optimization for Docker builds
  trailingSlash: false,
  // Enable SWC minification
  swcMinify: true,
};

export default nextConfig;
