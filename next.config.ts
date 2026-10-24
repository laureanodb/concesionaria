import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Solo se optimizan las fotos servidas por /api/fotos (ver src/app/api/fotos).
    localPatterns: [{ pathname: "/api/fotos/**", search: "" }],
  },
  experimental: {
    serverActions: {
      // Las fotos se suben de a una (máx. 8 MB cada una).
      bodySizeLimit: "10mb",
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
