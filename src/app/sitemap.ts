import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/categories";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://buildrank.lol";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await prisma.product.findMany({
    where: { totalPaid: { gt: 0 } },
    select: { id: true, createdAt: true },
  });

  return [
    { url: siteUrl, changeFrequency: "always", priority: 1 },
    { url: `${siteUrl}/submit`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/stats`, changeFrequency: "hourly", priority: 0.6 },
    ...CATEGORIES.map((c) => ({
      url: `${siteUrl}/?category=${c.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...products.map((p) => ({
      url: `${siteUrl}/product/${p.id}`,
      lastModified: p.createdAt,
      changeFrequency: "daily" as const,
      priority: 0.4,
    })),
  ];
}
