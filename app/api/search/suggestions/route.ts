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
    // Try with similarity() first (requires pg_trgm extension).
    // We match against both name and nameEn so a query in either language
    // surfaces the right products.
    let products: ProductSuggestion[];
    try {
      products = hasUnaccent
        ? await prisma.$queryRaw<ProductSuggestion[]>`
            SELECT
              p.id::text, p.name, p."nameEn", p.slug, p.price::text,
              COALESCE(p.images[1], '/images/placeholder.svg') AS image,
              p.brand, p.category, c."nameEn" AS "categoryEn"
            FROM "Product" p
            LEFT JOIN "Category" c ON c.id = p."categoryId"
            WHERE p."deletedAt" IS NULL
              AND (
                unaccent(p.name) ILIKE unaccent(${likeTerm})
                OR unaccent(COALESCE(p."nameEn", '')) ILIKE unaccent(${likeTerm})
                OR unaccent(p.brand) ILIKE unaccent(${likeTerm})
              )
            ORDER BY GREATEST(
              similarity(unaccent(p.name), unaccent(${q})),
              similarity(unaccent(COALESCE(p."nameEn", '')), unaccent(${q}))
            ) DESC
            LIMIT 5
          `
        : await prisma.$queryRaw<ProductSuggestion[]>`
            SELECT
              p.id::text, p.name, p."nameEn", p.slug, p.price::text,
              COALESCE(p.images[1], '/images/placeholder.svg') AS image,
              p.brand, p.category, c."nameEn" AS "categoryEn"
            FROM "Product" p
            LEFT JOIN "Category" c ON c.id = p."categoryId"
            WHERE p."deletedAt" IS NULL
              AND (p.name ILIKE ${likeTerm} OR COALESCE(p."nameEn",'') ILIKE ${likeTerm} OR p.brand ILIKE ${likeTerm})
            ORDER BY GREATEST(similarity(p.name, ${q}), similarity(COALESCE(p."nameEn",''), ${q})) DESC
            LIMIT 5
          `;
    } catch {
      // Fallback without similarity() if pg_trgm is not installed
      products = hasUnaccent
        ? await prisma.$queryRaw<ProductSuggestion[]>`
            SELECT
              p.id::text, p.name, p."nameEn", p.slug, p.price::text,
              COALESCE(p.images[1], '/images/placeholder.svg') AS image,
              p.brand, p.category, c."nameEn" AS "categoryEn"
            FROM "Product" p
            LEFT JOIN "Category" c ON c.id = p."categoryId"
            WHERE p."deletedAt" IS NULL
              AND (
                unaccent(p.name) ILIKE unaccent(${likeTerm})
                OR unaccent(COALESCE(p."nameEn", '')) ILIKE unaccent(${likeTerm})
                OR unaccent(p.brand) ILIKE unaccent(${likeTerm})
              )
            ORDER BY p.name ASC
            LIMIT 5
          `
        : await prisma.$queryRaw<ProductSuggestion[]>`
            SELECT
              p.id::text, p.name, p."nameEn", p.slug, p.price::text,
              COALESCE(p.images[1], '/images/placeholder.svg') AS image,
              p.brand, p.category, c."nameEn" AS "categoryEn"
            FROM "Product" p
            LEFT JOIN "Category" c ON c.id = p."categoryId"
            WHERE p."deletedAt" IS NULL
              AND (p.name ILIKE ${likeTerm} OR COALESCE(p."nameEn",'') ILIKE ${likeTerm} OR p.brand ILIKE ${likeTerm})
            ORDER BY p.name ASC
            LIMIT 5
          `;
    }

    const categories = hasUnaccent
      ? await prisma.$queryRaw<CategorySuggestion[]>`
          SELECT
            p.category,
            MAX(c."nameEn") AS "categoryEn",
            COUNT(*)::int AS count
          FROM "Product" p
          LEFT JOIN "Category" c ON c.id = p."categoryId"
          WHERE p."deletedAt" IS NULL
            AND (
              unaccent(p.category) ILIKE unaccent(${likeTerm})
              OR unaccent(COALESCE(c."nameEn", '')) ILIKE unaccent(${likeTerm})
            )
          GROUP BY p.category
          ORDER BY count DESC
          LIMIT 3
        `
      : await prisma.$queryRaw<CategorySuggestion[]>`
          SELECT
            p.category,
            MAX(c."nameEn") AS "categoryEn",
            COUNT(*)::int AS count
          FROM "Product" p
          LEFT JOIN "Category" c ON c.id = p."categoryId"
          WHERE p."deletedAt" IS NULL
            AND (p.category ILIKE ${likeTerm} OR COALESCE(c."nameEn",'') ILIKE ${likeTerm})
          GROUP BY p.category
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
