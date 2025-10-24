import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

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

const withSerwist = withSerwistInit({
  disable: !isProd,
  cacheOnNavigation: true,
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  globDirectory: "public"
});

export default withSerwist(baseConfig);
