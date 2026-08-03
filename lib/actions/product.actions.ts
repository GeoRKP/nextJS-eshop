"use server";
import { prisma } from "@/db/prisma";
import { formatError, toPlainObject } from "../utils";
import { LATEST_PRODUCTS_LIMIT, PAGE_SIZE } from "../constants";
import { revalidatePath, revalidateTag } from "next/cache";
import { unstable_cache } from "next/cache";
import { insertProductSchema, updateProductSchema, createInsertProductSchema, createUpdateProductSchema } from "../validators";
import { z } from "zod/v3";
import { Prisma } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { assertAdmin } from "@/lib/auth-guard";
import { logAuditEvent } from "@/lib/audit-log";
import { deleteUploadedImages, diffImages } from "@/lib/file-cleanup";
import { foldGreekSql, foldGreekSqlNoUnaccent } from "@/lib/greek-search";

export const getLatestProducts = unstable_cache(
  async (limit?: number) => {
    const data = await prisma.product.findMany({
      where: { deletedAt: null },
      take: limit ?? LATEST_PRODUCTS_LIMIT,
      orderBy: {
        createdAt: "desc",
      },
    });

    return toPlainObject(data);
  },
  ["getLatestProducts"],
  { revalidate: 300, tags: ["products"] }
);

export const getProductBySlug = unstable_cache(
  async (slug: string) => {
    return await prisma.product.findFirst({
      where: {
        slug: slug,
        deletedAt: null,
      },
      include: {
        categoryRef: {
          select: { id: true, name: true, nameEn: true, slug: true },
        },
      },
    });
  },
  ["getProductBySlug"],
  { revalidate: 300, tags: ["products"] }
);

export async function getProductById(productId: string) {
  const data = await prisma.product.findFirst({
    where: {
      id: productId,
      deletedAt: null,
    },
  });

  return toPlainObject(data);
}

// Resolve a category name to the set of category UUIDs that should be matched.
// If the selected category is a parent, returns IDs of all its active children
// (plus its own ID). If it's a leaf, returns just its own ID.
// Falls back to matching on the Product.category text field if not found.
async function resolveCategoryFilter(categoryName: string): Promise<{
  ids: string[] | null;
  textFallback: string | null;
}> {
  const cat = await prisma.category.findFirst({
    where: { name: categoryName, isActive: true },
    include: {
      children: {
        where: { isActive: true },
        select: { id: true },
      },
    },
  });

  if (!cat) {
    // Category not in the Category table — fall back to text match
    return { ids: null, textFallback: categoryName };
  }

  // Collect this category's ID plus all children IDs
  const ids = [cat.id, ...cat.children.map((c) => c.id)];
  return { ids, textFallback: null };
}

// Lazily ensure the unaccent extension is available for accent-insensitive search
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

// Memoized schema probe — the search_vector column either exists or it doesn't;
// no need to re-probe on every search request.
let _fullTextReady: boolean | null = null;
async function ensureFullText(): Promise<boolean> {
  if (_fullTextReady !== null) return _fullTextReady;
  try {
    await prisma.$queryRaw`SELECT search_vector FROM "Product" LIMIT 0`;
    _fullTextReady = true;
  } catch {
    _fullTextReady = false;
  }
  return _fullTextReady;
}

// Get all products
export async function getAllProducts({
  query,
  limit = PAGE_SIZE,
  page,
  price,
  sort,
  category,
  brand,
}: {
  query: string;
  limit?: number;
  page: number;
  price?: string;
  sort?: string;
  category?: string;
  brand?: string;
}) {
  const brandFilter = brand && brand !== "all" ? brand : null;
  const hasTextQuery = query && query !== "all" && query.trim() !== "";

  // Resolve category hierarchy: if a parent is selected, include children
  let categoryFilter: { ids: string[] | null; textFallback: string | null } | null = null;
  if (category && category !== "all") {
    categoryFilter = await resolveCategoryFilter(category);
  }

  // ─── Full-text search path (raw SQL with tsvector, fallback to ILIKE) ───
  if (hasTextQuery) {
    // Check if search_vector column exists (it's created by a custom migration)
    const likeTerm = `%${query}%`;
    const [useFullText, hasUnaccent] = await Promise.all([
      ensureFullText(),
      ensureUnaccent(),
    ]);

    // Both sides go through foldGreekSql (lower + unaccent + final-sigma fold),
    // so LIKE is correct here — the operands are already case-folded and ILIKE
    // would only re-apply a lowercasing that mishandles ς.
    const fold = hasUnaccent ? foldGreekSql : foldGreekSqlNoUnaccent;
    const term = fold(Prisma.sql`${likeTerm}`);

    const likeAny = (columns: Prisma.Sql[]) =>
      Prisma.join(
        columns.map((col) => Prisma.sql`${fold(col)} LIKE ${term}`),
        " OR "
      );

    const nameBrand = likeAny([Prisma.sql`name`, Prisma.sql`brand`]);
    const allFields = likeAny([
      Prisma.sql`name`,
      Prisma.sql`brand`,
      Prisma.sql`category`,
      Prisma.sql`description`,
    ]);

    const searchCondition = useFullText
      ? Prisma.sql`(search_vector @@ plainto_tsquery('simple', ${query}) OR ${nameBrand})`
      : Prisma.sql`(${allFields})`;

    const conditions: Prisma.Sql[] = [
      searchCondition,
      Prisma.sql`"deletedAt" IS NULL`,
    ];

    if (categoryFilter) {
      if (categoryFilter.ids) {
        // Filter by categoryId (UUID) — handles both parent and child categories
        const uuidIds = categoryFilter.ids.map((id) => Prisma.sql`${id}::uuid`);
        conditions.push(
          Prisma.sql`"categoryId" IN (${Prisma.join(uuidIds)})`
        );
      } else if (categoryFilter.textFallback) {
        // Fallback: match on the text category field
        conditions.push(Prisma.sql`category = ${categoryFilter.textFallback}`);
      }
    }
    if (brandFilter) {
      conditions.push(Prisma.sql`brand = ${brandFilter}`);
    }
    if (price && price !== "all") {
      const [min, max] = price.split("-").map(Number);
      conditions.push(Prisma.sql`price >= ${min} AND price <= ${max}`);
    }
    const whereClause = Prisma.join(conditions, " AND ");

    const orderClause =
      sort === "lowest"
        ? Prisma.sql`price ASC`
        : sort === "highest"
          ? Prisma.sql`price DESC`
          : useFullText
            ? Prisma.sql`ts_rank(search_vector, plainto_tsquery('simple', ${query})) DESC`
            : Prisma.sql`name ASC`;

    const offset = (page - 1) * limit;

    type RawProduct = {
      id: string;
      name: string;
      slug: string;
      category: string;
      images: string[];
      brand: string;
      description: string;
      stock: number;
      price: string;
      isfeatured: boolean;
      banner: string | null;
      createdat: Date;
      lowstockthreshold: number;
      allowbackorder: boolean;
    };

    const [rows, countResult] = await Promise.all([
      prisma.$queryRaw<RawProduct[]>`
        SELECT
          id::text, name, slug, category, images, brand, description, stock,
          price::text,
          "isFeatured" AS isfeatured, banner, "createdAt" AS createdat,
          "lowStockThreshold" AS lowstockthreshold, "allowBackorder" AS allowbackorder
        FROM "Product"
        WHERE ${whereClause}
        ORDER BY ${orderClause}
        LIMIT ${limit} OFFSET ${offset}
      `,
      prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) AS count FROM "Product" WHERE ${whereClause}
      `,
    ]);

    // Map raw rows to match Prisma model shape
    const data = rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      category: r.category,
      images: r.images,
      brand: r.brand,
      description: r.description,
      stock: r.stock,
      price: r.price,
      isFeatured: r.isfeatured,
      banner: r.banner,
      createdAt: r.createdat,
      lowStockThreshold: r.lowstockthreshold,
      allowBackorder: r.allowbackorder,
    }));

    const total = Number(countResult[0].count);

    return {
      data,
      totalCount: total,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ─── Prisma path (filters only, no text query) ───
  const categoryWhere: Prisma.ProductWhereInput = categoryFilter
    ? categoryFilter.ids
      ? { categoryId: { in: categoryFilter.ids } }
      : categoryFilter.textFallback
        ? { category: { equals: categoryFilter.textFallback } as Prisma.StringFilter }
        : {}
    : {};

  const priceFilter: Prisma.ProductWhereInput =
    price && price !== "all"
      ? {
          price: {
            gte: Number(price.split("-")[0]),
            lte: Number(price.split("-")[1]),
          },
        }
      : {};

  const where = {
    ...categoryWhere,
    ...priceFilter,
    ...(brandFilter ? { brand: brandFilter } : {}),
    deletedAt: null,
  };

  const [data, dataCount] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy:
        sort === "lowest"
          ? { price: "asc" }
          : sort === "highest"
            ? { price: "desc" }
            : { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    data,
    totalCount: dataCount,
    totalPages: Math.ceil(dataCount / limit),
  };
}

// Delete product (soft delete)
export async function deleteProduct(id: string) {
  try {
    await assertAdmin();
    const t = await getTranslations("Actions");
    const productExists = await prisma.product.findFirst({
      where: {
        id: id,
      },
    });

    if (!productExists) throw new Error(t("productNotFound"));

    await prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await logAuditEvent({
      action: "product.delete",
      entity: "Product",
      entityId: id,
      details: { name: productExists.name },
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/en/products");
    revalidateTag("products", "max");
    revalidateTag("categories", "max");

    return { success: true, message: t("productDeletedSuccessfully") };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Create a product
export async function createProduct(data: z.infer<typeof insertProductSchema>) {
  try {
    await assertAdmin();
    const t = await getTranslations("Actions");
    const tV = await getTranslations("Validation");
    const product = createInsertProductSchema(tV).parse(data);

    const created = await prisma.product.create({
      data: product,
    });

    // Initialize price history with creation price
    await prisma.priceHistory.create({
      data: { productId: created.id, price: product.price },
    });

    await logAuditEvent({
      action: "product.create",
      entity: "Product",
      entityId: created.id,
      details: { name: product.name, price: String(product.price) },
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/en/products");
    revalidateTag("products", "max");
    revalidateTag("categories", "max");

    return { success: true, message: t("productCreatedSuccessfully") };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update a product
export async function updateProduct(data: z.infer<typeof updateProductSchema>) {
  try {
    await assertAdmin();
    const t = await getTranslations("Actions");
    const tV = await getTranslations("Validation");
    const product = createUpdateProductSchema(tV).parse(data);

    const productExists = await prisma.product.findFirst({
      where: {
        id: product.id,
      },
    });


    if (!productExists) throw new Error(t("productNotFound"));

    // Track price change for compliance/audit (Greek tax authority)
    const oldPrice = Number(productExists.price);
    const newPrice = Number(product.price);
    const priceChanged = oldPrice !== newPrice;

    const removedImages = diffImages(productExists.images, product.images);
    const removedBanner =
      productExists.banner && productExists.banner !== product.banner
        ? [productExists.banner]
        : [];

    await prisma.product.update({
      where: {
        id: product.id,
      },
      data: product,
    });

    await deleteUploadedImages([...removedImages, ...removedBanner]);

    if (priceChanged) {
      await prisma.priceHistory.create({
        data: { productId: product.id, price: product.price },
      });
    }

    await logAuditEvent({
      action: "product.update",
      entity: "Product",
      entityId: product.id,
      details: priceChanged
        ? { name: product.name, oldPrice, newPrice }
        : { name: product.name },
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/en/products");
    revalidateTag("products", "max");
    revalidateTag("categories", "max");

    return { success: true, message: t("productUpdatedSuccessfully") };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Get all categories with hierarchy from Category model
export const getAllCategories = unstable_cache(
  async () => {
    const parents = await prisma.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        children: {
          where: { isActive: true },
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
          include: {
            _count: { select: { products: { where: { deletedAt: null } } } },
          },
        },
        _count: { select: { products: { where: { deletedAt: null } } } },
      },
    });

    return parents.map((parent) => {
      const childProductCount = parent.children.reduce(
        (sum, child) => sum + child._count.products,
        0
      );
      return {
        name: parent.name,
        nameEn: parent.nameEn,
        slug: parent.slug,
        productCount: parent._count.products + childProductCount,
        children: parent.children.map((child) => ({
          name: child.name,
          nameEn: child.nameEn,
          slug: child.slug,
          productCount: child._count.products,
        })),
      };
    });
  },
  ["getAllCategories"],
  { revalidate: 300, tags: ["categories"] }
);

// Get "Did you mean?" suggestions using pg_trgm similarity
export async function getDidYouMean(query: string): Promise<string[]> {
  if (!query || query.trim() === "") return [];
  const hasUnaccent = await ensureUnaccent();

  try {
    const results = hasUnaccent
      ? await prisma.$queryRaw<{ name: string }[]>`
          SELECT DISTINCT name, similarity(unaccent(name), unaccent(${query})) AS sim
          FROM "Product"
          WHERE similarity(unaccent(name), unaccent(${query})) > 0.15
            AND "deletedAt" IS NULL
          ORDER BY sim DESC
          LIMIT 3
        `
      : await prisma.$queryRaw<{ name: string }[]>`
          SELECT DISTINCT name, similarity(name, ${query}) AS sim
          FROM "Product"
          WHERE similarity(name, ${query}) > 0.15
            AND "deletedAt" IS NULL
          ORDER BY sim DESC
          LIMIT 3
        `;

    return results.map((r) => r.name);
  } catch {
    // Fallback if pg_trgm extension is not available
    const likeTerm = `%${query}%`;
    const results = hasUnaccent
      ? await prisma.$queryRaw<{ name: string }[]>`
          SELECT DISTINCT name
          FROM "Product"
          WHERE unaccent(name) ILIKE unaccent(${likeTerm})
            AND "deletedAt" IS NULL
          ORDER BY name ASC
          LIMIT 3
        `
      : await prisma.$queryRaw<{ name: string }[]>`
          SELECT DISTINCT name
          FROM "Product"
          WHERE name ILIKE ${likeTerm}
            AND "deletedAt" IS NULL
          ORDER BY name ASC
          LIMIT 3
        `;
    return results.map((r) => r.name);
  }
}

// Get product price range (min/max) for slider filter
export const getProductPriceRange = unstable_cache(
  async (): Promise<{ min: number; max: number }> => {
    const result = await prisma.$queryRaw<[{ min: string; max: string }]>`
      SELECT MIN(price)::text AS min, MAX(price)::text AS max
      FROM "Product"
      WHERE "deletedAt" IS NULL
    `;

    return {
      min: Math.floor(Number(result[0]?.min ?? 0)),
      max: Math.ceil(Number(result[0]?.max ?? 2000)),
    };
  },
  ["getProductPriceRange"],
  { revalidate: 300, tags: ["products"] }
);

// Get related products by category
export const getRelatedProducts = unstable_cache(
  async (category: string, excludeId: string, limit = 4) => {
    const data = await prisma.product.findMany({
      where: {
        category,
        id: { not: excludeId },
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return toPlainObject(data);
  },
  ["getRelatedProducts"],
  { revalidate: 300, tags: ["products"] }
);

// Get featured products
export const getFeaturedProducts = unstable_cache(
  async () => {
    const data = await prisma.product.findMany({
      where: {
        isFeatured: true,
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

    return toPlainObject(data);
  },
  ["getFeaturedProducts"],
  { revalidate: 300, tags: ["products"] }
);

// Get best sellers by paid order volume — falls back to featured products
// when there is no sales data yet, so the homepage section never goes empty.
export const getBestSellers = unstable_cache(
  async (limit: number = 8) => {
    const grouped = await prisma.orderItem.groupBy({
      by: ["productId"],
      where: { order: { isPaid: true } },
      _sum: { qty: true },
      orderBy: { _sum: { qty: "desc" } },
      take: limit,
    });

    if (grouped.length > 0) {
      const products = await prisma.product.findMany({
        where: {
          id: { in: grouped.map((g) => g.productId) },
          deletedAt: null,
        },
      });
      // Preserve sales-volume ordering
      const byId = new Map(products.map((p) => [p.id, p]));
      const ordered = grouped
        .map((g) => byId.get(g.productId))
        .filter((p): p is NonNullable<typeof p> => Boolean(p));
      if (ordered.length > 0) return toPlainObject(ordered);
    }

    const featured = await prisma.product.findMany({
      where: { isFeatured: true, deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return toPlainObject(featured);
  },
  ["getBestSellers"],
  { revalidate: 300, tags: ["products"] }
);

// Real catalog stats for the promo banner — no invented marketing numbers.
export const getCatalogStats = unstable_cache(
  async () => {
    const [products, brands, categories] = await Promise.all([
      prisma.product.count({ where: { deletedAt: null } }),
      prisma.product.findMany({
        where: { deletedAt: null },
        distinct: ["brand"],
        select: { brand: true },
      }),
      prisma.product.findMany({
        where: { deletedAt: null },
        distinct: ["category"],
        select: { category: true },
      }),
    ]);
    return {
      products,
      brands: brands.length,
      categories: categories.length,
    };
  },
  ["getCatalogStats"],
  { revalidate: 3600, tags: ["products"] }
);
