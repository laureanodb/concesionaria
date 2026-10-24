import type { NextConfig } from "next";

// Fotos en Supabase Storage: se permite optimizar solo las del bucket público de este proyecto.
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseImages = supabaseUrl ? [new URL("/storage/v1/object/public/**", supabaseUrl)] : [];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Fotos locales (desarrollo) y de Supabase Storage (producción).
    localPatterns: [{ pathname: "/api/fotos/**", search: "" }],
    remotePatterns: supabaseImages,
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
