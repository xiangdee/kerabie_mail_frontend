import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["res.cloudinary.com","images.unsplash.com","randomuser.me"],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.backblazeb2.com',
      },

    ]
  },
};

export default nextConfig;
