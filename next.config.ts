import type { NextConfig } from "next";

// Avoid build failures when Google Fonts are not reachable in CI/CD.
process.env.NEXT_DISABLE_GOOGLE_FONTS = "1";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
