import type { MetadataRoute } from "next";
import { prisma } from "@/db/prisma";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://your-domain.com";

  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    select: { slug: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/en`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/en/search`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
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
