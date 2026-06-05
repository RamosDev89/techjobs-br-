import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "logo.clearbit.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
  serverExternalPackages: ["@prisma/client", "prisma"],
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
