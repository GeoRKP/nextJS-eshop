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
                translate(lower(unaccent(p.name)),'ς','σ') LIKE translate(lower(unaccent(${likeTerm})),'ς','σ')
                OR translate(lower(unaccent(COALESCE(p."nameEn", ''))),'ς','σ') LIKE translate(lower(unaccent(${likeTerm})),'ς','σ')
                OR translate(lower(unaccent(p.brand)),'ς','σ') LIKE translate(lower(unaccent(${likeTerm})),'ς','σ')
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
              AND (translate(lower(p.name),'ς','σ') LIKE translate(lower(${likeTerm}),'ς','σ') OR translate(lower(COALESCE(p."nameEn",'')),'ς','σ') LIKE translate(lower(${likeTerm}),'ς','σ') OR translate(lower(p.brand),'ς','σ') LIKE translate(lower(${likeTerm}),'ς','σ'))
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
                translate(lower(unaccent(p.name)),'ς','σ') LIKE translate(lower(unaccent(${likeTerm})),'ς','σ')
                OR translate(lower(unaccent(COALESCE(p."nameEn", ''))),'ς','σ') LIKE translate(lower(unaccent(${likeTerm})),'ς','σ')
                OR translate(lower(unaccent(p.brand)),'ς','σ') LIKE translate(lower(unaccent(${likeTerm})),'ς','σ')
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
              AND (translate(lower(p.name),'ς','σ') LIKE translate(lower(${likeTerm}),'ς','σ') OR translate(lower(COALESCE(p."nameEn",'')),'ς','σ') LIKE translate(lower(${likeTerm}),'ς','σ') OR translate(lower(p.brand),'ς','σ') LIKE translate(lower(${likeTerm}),'ς','σ'))
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
              translate(lower(unaccent(p.category)),'ς','σ') LIKE translate(lower(unaccent(${likeTerm})),'ς','σ')
              OR translate(lower(unaccent(COALESCE(c."nameEn", ''))),'ς','σ') LIKE translate(lower(unaccent(${likeTerm})),'ς','σ')
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
            AND (translate(lower(p.category),'ς','σ') LIKE translate(lower(${likeTerm}),'ς','σ') OR translate(lower(COALESCE(c."nameEn",'')),'ς','σ') LIKE translate(lower(${likeTerm}),'ς','σ'))
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
