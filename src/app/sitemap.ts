import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { getSitemapVehicles } from "@/lib/vehicles";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const vehicles = await getSitemapVehicles();
  return [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/autos`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/contacto`, changeFrequency: "monthly", priority: 0.5 },
    ...vehicles.map((v) => ({
      url: `${base}/autos/${v.slug}`,
      lastModified: v.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
