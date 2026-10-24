import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Fotos locales (desarrollo) y de Vercel Blob (producción).
    localPatterns: [{ pathname: "/api/fotos/**", search: "" }],
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com", pathname: "/vehiculos/**" }],
  },
  experimental: {
    serverActions: {
      // Las fotos se achican en el navegador y se suben de a una (máx. 4 MB).
      // Vercel no acepta pedidos de más de 4,5 MB.
      bodySizeLimit: "4mb",
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
