"use server";
import { prisma } from "@/db/prisma";
import { formatError, toPlainObject } from "../utils";
import { LATEST_PRODUCTS_LIMIT, PAGE_SIZE } from "../constants";
import { revalidatePath, revalidateTag } from "next/cache";
import { unstable_cache } from "next/cache";
import { insertProductSchema, updateProductSchema, createInsertProductSchema, createUpdateProductSchema } from "../validators";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { getTranslations } from "next-intl/server";

export async function getLatestProducts(limit?: number) {
  const data = await prisma.product.findMany({
    where: { deletedAt: null },
    take: limit ?? LATEST_PRODUCTS_LIMIT,
    orderBy: {
      createdAt: "desc",
    },
  });

  return toPlainObject(data);
}

export async function getProductBySlug(slug: string) {
  return await prisma.product.findFirst({
    where: {
      slug: slug,
      deletedAt: null,
    },
  });
}

export async function getProductById(productId: string) {
  const data = await prisma.product.findFirst({
    where: {
      id: productId,
    },
  });

  return toPlainObject(data);
}

// Get all products
export async function getAllProducts({
  query,
  limit = PAGE_SIZE,
  page,
  price,
  rating,
  sort,
  category,
}: {
  query: string;
  limit?: number;
  page: number;
  price?: string;
  rating?: string;
  sort?: string;
  category?: string;
}) {
  const hasTextQuery = query && query !== "all" && query.trim() !== "";

  // ─── Full-text search path (raw SQL with tsvector) ───
  if (hasTextQuery) {
    const conditions: Prisma.Sql[] = [
      Prisma.sql`search_vector @@ plainto_tsquery('english', ${query})`,
      Prisma.sql`"deletedAt" IS NULL`,
    ];

    if (category && category !== "all") {
      conditions.push(Prisma.sql`category = ${category}`);
    }
    if (price && price !== "all") {
      const [min, max] = price.split("-").map(Number);
      conditions.push(Prisma.sql`price >= ${min} AND price <= ${max}`);
    }
    if (rating && rating !== "all") {
      conditions.push(Prisma.sql`rating >= ${Number(rating)}`);
    }

    const whereClause = Prisma.join(conditions, " AND ");

    const orderClause =
      sort === "lowest"
        ? Prisma.sql`price ASC`
        : sort === "highest"
          ? Prisma.sql`price DESC`
          : sort === "rating"
            ? Prisma.sql`rating DESC`
            : Prisma.sql`ts_rank(search_vector, plainto_tsquery('english', ${query})) DESC`;

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
      rating: string;
      numreviews: number;
      isfeatured: boolean;
      banner: string | null;
      createdat: Date;
    };

    const [rows, countResult] = await Promise.all([
      prisma.$queryRaw<RawProduct[]>`
        SELECT
          id::text, name, slug, category, images, brand, description, stock,
          price::text, rating::text, "numReviews" AS numreviews,
          "isFeatured" AS isfeatured, banner, "createdAt" AS createdat
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
      rating: r.rating,
      numReviews: r.numreviews,
      isFeatured: r.isfeatured,
      banner: r.banner,
      createdAt: r.createdat,
    }));

    const total = Number(countResult[0].count);

    return {
      data,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ─── Prisma path (filters only, no text query) ───
  const categoryFilter: Prisma.ProductWhereInput =
    category && category !== "all"
      ? { category: { equals: category } as Prisma.StringFilter }
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

  const ratingFilter: Prisma.ProductWhereInput =
    rating && rating !== "all"
      ? { rating: { gte: Number(rating) } }
      : {};

  const where = {
    ...categoryFilter,
    ...priceFilter,
    ...ratingFilter,
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
            : sort === "rating"
              ? { rating: "desc" }
              : { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
}

// Delete product (soft delete)
export async function deleteProduct(id: string) {
  try {
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

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidateTag("products");
    revalidateTag("categories");

    return { success: true, message: t("productDeletedSuccessfully") };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Create a product
export async function createProduct(data: z.infer<typeof insertProductSchema>) {
  try {
    const t = await getTranslations("Actions");
    const tV = await getTranslations("Validation");
    const product = createInsertProductSchema(tV).parse(data);

    await prisma.product.create({
      data: product,
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidateTag("products");
    revalidateTag("categories");

    return { success: true, message: t("productCreatedSuccessfully") };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update a product
export async function updateProduct(data: z.infer<typeof updateProductSchema>) {
  try {
    const t = await getTranslations("Actions");
    const tV = await getTranslations("Validation");
    const product = createUpdateProductSchema(tV).parse(data);

    const productExists = await prisma.product.findFirst({
      where: {
        id: product.id,
      },
    });


    if (!productExists) throw new Error(t("productNotFound"));

    await prisma.product.update({
      where: {
        id: product.id,
      },
      data: product,
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidateTag("products");
    revalidateTag("categories");

    return { success: true, message: t("productUpdatedSuccessfully") };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Get all categories (legacy — from distinct text field)
export const getAllCategories = unstable_cache(
  async () => {
    const data = await prisma.product.groupBy({
      by: ["category"],
      where: { deletedAt: null },
      _count: true,
    });

    return data;
  },
  ["getAllCategories"],
  { revalidate: 3600, tags: ["categories"] }
);

// Get "Did you mean?" suggestions using pg_trgm similarity
export async function getDidYouMean(query: string): Promise<string[]> {
  if (!query || query.trim() === "") return [];

  const results = await prisma.$queryRaw<{ name: string }[]>`
    SELECT DISTINCT name, similarity(name, ${query}) AS sim
    FROM "Product"
    WHERE similarity(name, ${query}) > 0.15
      AND "deletedAt" IS NULL
    ORDER BY sim DESC
    LIMIT 3
  `;

  return results.map((r) => r.name);
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
  { revalidate: 3600, tags: ["products"] }
);

// Get related products by category
export async function getRelatedProducts(
  category: string,
  excludeId: string,
  limit = 4
) {
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
}

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
      take: 4,
    });

    return toPlainObject(data);
  },
  ["getFeaturedProducts"],
  { revalidate: 300, tags: ["products"] }
);
