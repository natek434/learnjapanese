import type { NextConfig } from "next";
import withPWA from "next-pwa";

const isProd = process.env.NODE_ENV === "production";

const baseConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "1mb"
    }
  },
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      }
    ]
  }
};

export default withPWA({
  dest: "public",
  disable: !isProd,
  register: true,
  skipWaiting: true
})(baseConfig);
