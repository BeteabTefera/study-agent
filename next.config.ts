import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // Required for Docker deployment
  reactStrictMode: true,
  
  // Optional: Configure external packages if needed
  experimental: {
    // Add any experimental features here
  },
};

export default nextConfig;