import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "usernames.worldcoin.org",
      },
      {
        protocol: "https",
        hostname: "**.worldcoin.org",
      },
    ],
  },
};

export default nextConfig;
