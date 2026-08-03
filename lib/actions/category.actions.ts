"use server";

import { prisma } from "@/db/prisma";
import { formatError, toPlainObject } from "../utils";
import { revalidatePath, revalidateTag } from "next/cache";
import { unstable_cache } from "next/cache";
import { createInsertCategorySchema, createUpdateCategorySchema } from "../validators";
import { z } from "zod/v3";
import { insertCategorySchema, updateCategorySchema } from "../validators";
import { getTranslations } from "next-intl/server";
import { assertAdmin } from "@/lib/auth-guard";
import { logAuditEvent } from "@/lib/audit-log";

// Get all categories as a flat list
export async function getAllCategoriesFlat() {
  const data = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      _count: { select: { products: true } },
    },
  });

  return toPlainObject(data);
}

// Get categories as a hierarchical tree (cached)
export const getCategoryTree = unstable_cache(
  async () => {
    const data = await prisma.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        _count: { select: { products: true } },
        children: {
          where: { isActive: true },
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
          include: {
            _count: { select: { products: true } },
            children: {
              where: { isActive: true },
              orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
              include: {
                _count: { select: { products: true } },
              },
            },
          },
        },
      },
    });

    return toPlainObject(data);
  },
  ["category-tree"],
  { revalidate: 300, tags: ["categories"] }
);

// Get a single category by slug
export async function getCategoryBySlug(slug: string) {
  const data = await prisma.category.findFirst({
    where: { slug },
    include: {
      parent: true,
      children: {
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }],
      },
      _count: { select: { products: true } },
    },
  });

  return data ? toPlainObject(data) : null;
}

// Get a single category by id
export async function getCategoryById(id: string) {
  const data = await prisma.category.findFirst({
    where: { id },
    include: {
      parent: true,
      children: {
        orderBy: [{ sortOrder: "asc" }],
      },
    },
  });

  return data ? toPlainObject(data) : null;
}

// Admin: Get all categories including inactive (with pagination)
export async function getAdminCategories({
  page = 1,
  limit = 50,
}: { page?: number; limit?: number } = {}) {
  const [data, totalCount] = await Promise.all([
    prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        parent: { select: { id: true, name: true } },
        _count: { select: { products: true, children: true } },
      },
      take: limit,
      skip: (page - 1) * limit,
    }),
    prisma.category.count(),
  ]);

  return {
    data: toPlainObject(data),
    totalPages: Math.ceil(totalCount / limit),
  };
}

// Create category
export async function createCategory(data: z.infer<typeof insertCategorySchema>) {
  try {
    await assertAdmin();
    const t = await getTranslations("Actions");
    const tV = await getTranslations("Validation");
    const category = createInsertCategorySchema(tV).parse(data);

    const created = await prisma.category.create({
      data: {
        name: category.name,
        nameEn: category.nameEn ?? null,
        slug: category.slug,
        description: category.description,
        descriptionEn: category.descriptionEn ?? null,
        image: category.image,
        parentId: category.parentId,
        sortOrder: category.sortOrder,
        isActive: category.isActive,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/");
    revalidatePath("/en");
    revalidateTag("categories", "max");

    await logAuditEvent({
      action: "category.create",
      entity: "Category",
      entityId: created.id,
      details: { name: created.name, slug: created.slug },
    });

    return { success: true, message: t("categoryCreatedSuccessfully") };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update category
export async function updateCategory(data: z.infer<typeof updateCategorySchema>) {
  try {
    await assertAdmin();
    const t = await getTranslations("Actions");
    const tV = await getTranslations("Validation");
    const category = createUpdateCategorySchema(tV).parse(data);

    const existing = await prisma.category.findFirst({
      where: { id: category.id },
    });

    if (!existing) throw new Error(t("categoryNotFound"));

    await prisma.category.update({
      where: { id: category.id },
      data: {
        name: category.name,
        nameEn: category.nameEn ?? null,
        slug: category.slug,
        description: category.description,
        descriptionEn: category.descriptionEn ?? null,
        image: category.image,
        parentId: category.parentId,
        sortOrder: category.sortOrder,
        isActive: category.isActive,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/");
    revalidatePath("/en");
    revalidateTag("categories", "max");

    await logAuditEvent({
      action: "category.update",
      entity: "Category",
      entityId: category.id,
      details: { name: category.name, slug: category.slug },
    });

    return { success: true, message: t("categoryUpdatedSuccessfully") };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Delete category
export async function deleteCategory(id: string) {
  try {
    await assertAdmin();
    const t = await getTranslations("Actions");

    // Check if category has children
    const childCount = await prisma.category.count({
      where: { parentId: id },
    });

    if (childCount > 0) {
      throw new Error(t("categoryHasChildren"));
    }

    const deleted = await prisma.category.delete({ where: { id } });

    revalidatePath("/admin/categories");
    revalidatePath("/");
    revalidatePath("/en");
    revalidateTag("categories", "max");

    await logAuditEvent({
      action: "category.delete",
      entity: "Category",
      entityId: id,
      details: { name: deleted.name, slug: deleted.slug },
    });

    return { success: true, message: t("categoryDeletedSuccessfully") };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update category sort order
export async function updateCategorySortOrder(
  items: { id: string; sortOrder: number }[]
) {
  try {
    await assertAdmin();
    const t = await getTranslations("Actions");

    await prisma.$transaction(
      items.map((item) =>
        prisma.category.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        })
      )
    );

    revalidatePath("/admin/categories");
    revalidatePath("/");
    revalidatePath("/en");
    revalidateTag("categories", "max");

    return { success: true, message: t("categorySortUpdatedSuccessfully") };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
