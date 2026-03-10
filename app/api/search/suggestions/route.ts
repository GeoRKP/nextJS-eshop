import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import type { ProductSuggestion, CategorySuggestion } from "@/types/search";

// Lazily ensure unaccent extension is available
let _unaccentReady: boolean | null = null;
async function ensureUnaccent(): Promise<boolean> {
  if (_unaccentReady !== null) return _unaccentReady;
  try {
    await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS unaccent');
    _unaccentReady = true;
  } catch {
    _unaccentReady = false;
  }
  return _unaccentReady;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (!q) {
    return NextResponse.json({ products: [], categories: [] });
  }

  const likeTerm = `%${q}%`;
  const hasUnaccent = await ensureUnaccent();

  try {
    // Try with similarity() first (requires pg_trgm extension)
    let products: ProductSuggestion[];
    try {
      products = hasUnaccent
        ? await prisma.$queryRaw<ProductSuggestion[]>`
            SELECT
              id::text, name, slug, price::text,
              COALESCE(images[1], '/images/placeholder.svg') AS image,
              brand, category
            FROM "Product"
            WHERE "deletedAt" IS NULL
              AND (unaccent(name) ILIKE unaccent(${likeTerm}) OR unaccent(brand) ILIKE unaccent(${likeTerm}))
            ORDER BY similarity(unaccent(name), unaccent(${q})) DESC
            LIMIT 5
          `
        : await prisma.$queryRaw<ProductSuggestion[]>`
            SELECT
              id::text, name, slug, price::text,
              COALESCE(images[1], '/images/placeholder.svg') AS image,
              brand, category
            FROM "Product"
            WHERE "deletedAt" IS NULL
              AND (name ILIKE ${likeTerm} OR brand ILIKE ${likeTerm})
            ORDER BY similarity(name, ${q}) DESC
            LIMIT 5
          `;
    } catch {
      // Fallback without similarity() if pg_trgm is not installed
      products = hasUnaccent
        ? await prisma.$queryRaw<ProductSuggestion[]>`
            SELECT
              id::text, name, slug, price::text,
              COALESCE(images[1], '/images/placeholder.svg') AS image,
              brand, category
            FROM "Product"
            WHERE "deletedAt" IS NULL
              AND (unaccent(name) ILIKE unaccent(${likeTerm}) OR unaccent(brand) ILIKE unaccent(${likeTerm}))
            ORDER BY name ASC
            LIMIT 5
          `
        : await prisma.$queryRaw<ProductSuggestion[]>`
            SELECT
              id::text, name, slug, price::text,
              COALESCE(images[1], '/images/placeholder.svg') AS image,
              brand, category
            FROM "Product"
            WHERE "deletedAt" IS NULL
              AND (name ILIKE ${likeTerm} OR brand ILIKE ${likeTerm})
            ORDER BY name ASC
            LIMIT 5
          `;
    }

    const categories = hasUnaccent
      ? await prisma.$queryRaw<CategorySuggestion[]>`
          SELECT category, COUNT(*)::int AS count
          FROM "Product"
          WHERE "deletedAt" IS NULL
            AND unaccent(category) ILIKE unaccent(${likeTerm})
          GROUP BY category
          ORDER BY count DESC
          LIMIT 3
        `
      : await prisma.$queryRaw<CategorySuggestion[]>`
          SELECT category, COUNT(*)::int AS count
          FROM "Product"
          WHERE "deletedAt" IS NULL
            AND category ILIKE ${likeTerm}
          GROUP BY category
          ORDER BY count DESC
          LIMIT 3
        `;

    return NextResponse.json(
      { products, categories },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("Search suggestions error:", error);
    return NextResponse.json({ products: [], categories: [] });
  }
}
