import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import type { ProductSuggestion, CategorySuggestion } from "@/types/search";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (!q) {
    return NextResponse.json({ products: [], categories: [] });
  }

  const likeTerm = `%${q}%`;

  const [products, categories] = await Promise.all([
    // Product suggestions: ILIKE + trigram similarity, ordered by relevance
    prisma.$queryRaw<ProductSuggestion[]>`
      SELECT
        id::text,
        name,
        slug,
        price::text,
        images[1] AS image,
        brand,
        category
      FROM "Product"
      WHERE
        name ILIKE ${likeTerm}
        OR brand ILIKE ${likeTerm}
      ORDER BY similarity(name, ${q}) DESC
      LIMIT 5
    `,
    // Category suggestions: ILIKE match with product count
    prisma.$queryRaw<CategorySuggestion[]>`
      SELECT
        category,
        COUNT(*)::int AS count
      FROM "Product"
      WHERE category ILIKE ${likeTerm}
      GROUP BY category
      ORDER BY count DESC
      LIMIT 3
    `,
  ]);

  return NextResponse.json({ products, categories });
}
