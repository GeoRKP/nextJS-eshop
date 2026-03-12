"use server";

import { prisma } from "@/db/prisma";
import { getAuthSession } from "@/lib/auth-session";
import { formatError, toPlainObject } from "../utils";
import { revalidatePath } from "next/cache";
import { createInsertCouponSchema, createUpdateCouponSchema } from "../validators";
import { z } from "zod/v3";
import { insertCouponSchema, updateCouponSchema } from "../validators";
import { PAGE_SIZE } from "../constants";
import { getTranslations } from "next-intl/server";

// Validate a coupon code (for cart/checkout)
export async function validateCoupon(code: string) {
  try {
    const t = await getTranslations("Actions");
    const session = await getAuthSession();

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      throw new Error(t("couponNotFound"));
    }

    if (!coupon.isActive) {
      throw new Error(t("couponInactive"));
    }

    const now = new Date();
    if (coupon.validFrom > now) {
      throw new Error(t("couponNotYetValid"));
    }

    if (coupon.validUntil && coupon.validUntil < now) {
      throw new Error(t("couponExpired"));
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      throw new Error(t("couponMaxUsesReached"));
    }

    // Check per-user usage
    if (session?.user?.id) {
      const userUsageCount = await prisma.couponUsage.count({
        where: {
          couponId: coupon.id,
          userId: session.user.id,
        },
      });

      if (userUsageCount >= coupon.maxUsesPerUser) {
        throw new Error(t("couponMaxUsesPerUserReached"));
      }
    }

    return {
      success: true,
      message: t("couponValid"),
      data: toPlainObject(coupon),
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Apply coupon to cart
export async function applyCoupon(code: string) {
  try {
    const t = await getTranslations("Actions");

    // Validate first
    const validation = await validateCoupon(code);
    if (!validation.success || !validation.data) {
      return { success: false, message: validation.message };
    }

    return {
      success: true,
      message: t("couponApplied"),
      data: validation.data,
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Remove coupon from cart
export async function removeCoupon() {
  try {
    const t = await getTranslations("Actions");

    return {
      success: true,
      message: t("couponRemoved"),
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// ── Admin CRUD ──

// Get all coupons (admin)
export async function getAllCoupons({
  limit = PAGE_SIZE,
  page,
  query,
}: {
  limit?: number;
  page: number;
  query?: string;
}) {
  const where = query && query !== "all"
    ? {
        OR: [
          { code: { contains: query, mode: "insensitive" as const } },
          { description: { contains: query, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [data, dataCount] = await Promise.all([
    prisma.coupon.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: (page - 1) * limit,
    }),
    prisma.coupon.count({ where }),
  ]);

  return {
    data: toPlainObject(data),
    totalPages: Math.ceil(dataCount / limit),
  };
}

// Get coupon by id
export async function getCouponById(id: string) {
  const data = await prisma.coupon.findFirst({
    where: { id },
    include: {
      categories: { include: { category: true } },
      products: { include: { product: true } },
    },
  });

  return data ? toPlainObject(data) : null;
}

// Create coupon
export async function createCoupon(data: z.infer<typeof insertCouponSchema>) {
  try {
    const t = await getTranslations("Actions");
    const tV = await getTranslations("Validation");
    const parsed = createInsertCouponSchema(tV).parse(data);

    const { categoryIds, productIds, ...couponData } = parsed;

    await prisma.coupon.create({
      data: {
        ...couponData,
        categories: categoryIds.length > 0
          ? {
              create: categoryIds.map((categoryId) => ({
                categoryId,
              })),
            }
          : undefined,
        products: productIds.length > 0
          ? {
              create: productIds.map((productId) => ({
                productId,
              })),
            }
          : undefined,
      },
    });

    revalidatePath("/admin/coupons");

    return { success: true, message: t("couponCreatedSuccessfully") };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update coupon
export async function updateCoupon(data: z.infer<typeof updateCouponSchema>) {
  try {
    const t = await getTranslations("Actions");
    const tV = await getTranslations("Validation");
    const parsed = createUpdateCouponSchema(tV).parse(data);

    const existing = await prisma.coupon.findFirst({
      where: { id: parsed.id },
    });

    if (!existing) throw new Error(t("couponNotFound"));

    const { categoryIds, productIds, id, ...couponData } = parsed;

    await prisma.$transaction(async (tx) => {
      // Remove old associations
      await tx.couponCategory.deleteMany({ where: { couponId: id } });
      await tx.couponProduct.deleteMany({ where: { couponId: id } });

      // Update coupon
      await tx.coupon.update({
        where: { id },
        data: {
          ...couponData,
          categories: categoryIds.length > 0
            ? {
                create: categoryIds.map((categoryId) => ({
                  categoryId,
                })),
              }
            : undefined,
          products: productIds.length > 0
            ? {
                create: productIds.map((productId) => ({
                  productId,
                })),
              }
            : undefined,
        },
      });
    });

    revalidatePath("/admin/coupons");

    return { success: true, message: t("couponUpdatedSuccessfully") };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Delete coupon
export async function deleteCoupon(id: string) {
  try {
    const t = await getTranslations("Actions");
    await prisma.coupon.delete({ where: { id } });

    revalidatePath("/admin/coupons");

    return { success: true, message: t("couponDeletedSuccessfully") };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
