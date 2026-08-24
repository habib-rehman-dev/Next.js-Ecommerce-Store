import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com', // Add this line for Unsplash Premium
      },
    ],
  },
};

export default nextConfig;