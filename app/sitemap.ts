import type { MetadataRoute } from "next";
import { prisma } from "@/db/prisma";
import { SERVER_URL } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || SERVER_URL;

  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    select: { slug: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();

  // Both locales for every route: /el has no prefix (localePrefix "as-needed").
  const bothLocales = (
    path: string,
    changeFrequency: "daily" | "weekly" | "monthly",
    priority: number
  ): MetadataRoute.Sitemap => [
    { url: `${baseUrl}${path}`, lastModified: now, changeFrequency, priority },
    { url: `${baseUrl}/en${path}`, lastModified: now, changeFrequency, priority },
  ];

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/en`, lastModified: now, changeFrequency: "daily", priority: 1 },
    ...bothLocales("/search", "daily", 0.8),
    // Legal/info pages were missing entirely — they carry the shipping, returns
    // and privacy terms customers (and Google) look for.
    ...["/shipping", "/returns", "/terms", "/privacy", "/cookies"].flatMap(
      (path) => bothLocales(path, "monthly", 0.4)
    ),
  ];

  const productRoutes: MetadataRoute.Sitemap = products.flatMap((product) => [
    {
      url: `${baseUrl}/product/${product.slug}`,
      lastModified: product.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/en/product/${product.slug}`,
      lastModified: product.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
  ]);

  return [...staticRoutes, ...productRoutes];
}
