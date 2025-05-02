"use server";
import { prisma } from "@/db/prisma";
import { formatError, toPlainObject } from "../utils";
import { LATEST_PRODUCTS_LIMIT, PAGE_SIZE } from "../constants";
import { revalidatePath } from "next/cache";
import { insertProductSchema, updateProductSchema } from "../validators";
import { z } from "zod";
import { Prisma } from "@prisma/client";

export async function getLatestProducts() {
  const data = await prisma.product.findMany({
    take: LATEST_PRODUCTS_LIMIT,
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
  // Query Filter
  const queryFilter: Prisma.ProductWhereInput =
    query && query !== "all" ? {
      name: {
        contains: query,
        mode: "insensitive",
      } as Prisma.StringFilter
    } : {};

  //Category Filter
  const categoryFilter: Prisma.ProductWhereInput =
    category && category !== "all" ? {
      category: {
        equals: category,
      } as Prisma.StringFilter
    } : {};

  //Price Filter
  const priceFilter: Prisma.ProductWhereInput =
    price && price !== "all" ? {
      price: {
        gte: Number(price.split("-")[0]),
        lte: Number(price.split("-")[1]),
      }
    } : {};

  //Rating Filter
  const ratingFilter: Prisma.ProductWhereInput =
    rating && rating !== "all" ? {
      rating: {
        gte: Number(rating),
      }
    } : {};

  const data = await prisma.product.findMany({
    where: {
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    },
    orderBy: sort === 'lowest'
      ? { price: 'asc' }
      : sort === 'highest'
        ? { price: 'desc' }
        : sort === 'rating'
          ? { rating: 'desc' }
          : { createdAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
  });

  const dataCount = await prisma.product.count({
    where: {
      name: {
        contains: query,
      },
    },
  });

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
}

// Delete product
export async function deleteProduct(id: string) {
  try {
    const productExists = await prisma.product.findFirst({
      where: {
        id: id,
      },
    });

    if (!productExists) throw new Error("Product not found");

    await prisma.product.delete({
      where: {
        id: id,
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");

    return { success: true, message: "Product deleted successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Create a product
export async function createProduct(data: z.infer<typeof insertProductSchema>) {
  try {
    const product = insertProductSchema.parse(data);

    await prisma.product.create({
      data: product,
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");

    return { success: true, message: "Product created successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update a product
export async function updateProduct(data: z.infer<typeof updateProductSchema>) {
  try {
    const product = updateProductSchema.parse(data);

    const productExists = await prisma.product.findFirst({
      where: {
        id: product.id,
      },
    });


    if (!productExists) throw new Error("Product not found");

    await prisma.product.update({
      where: {
        id: product.id,
      },
      data: product,
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");

    return { success: true, message: "Product updated successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Get all categories
export async function getAllCategories() {

  const data = await prisma.product.groupBy({
    by: ["category"],
    _count: true,
  });

  return data;
}

// Get featured products
export async function getFeaturedProducts() {
  const data = await prisma.product.findMany({
    where: {
      isFeatured: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 4,
  });

  return toPlainObject(data);
}
