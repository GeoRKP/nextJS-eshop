"use server";

import { prisma } from "@/db/prisma";
import { getAuthSession } from "@/lib/auth-session";
import { formatError, toPlainObject } from "../utils";
import { revalidatePath, revalidateTag } from "next/cache";
import { getTranslations, getLocale } from "next-intl/server";
import { localizedName } from "@/lib/i18n-helpers";

// Get the current user's wishlist with only needed fields
export async function getMyWishlist() {
  const session = await getAuthSession();
  if (!session?.user?.id) return null;

  const wishlist = await prisma.wishlist.findUnique({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              nameEn: true,
              slug: true,
              price: true,
              images: true,
              stock: true,
              rating: true,
              numReviews: true,
              brand: true,
              category: true,
              isFeatured: true,
              createdAt: true,
              description: true,
              descriptionEn: true,
            },
          },
        },
        orderBy: { addedAt: "desc" },
      },
    },
  });

  if (!wishlist) return null;

  return toPlainObject(wishlist);
}

// Get wishlist item count
export async function getWishlistCount() {
  const session = await getAuthSession();
  if (!session?.user?.id) return 0;

  const wishlist = await prisma.wishlist.findUnique({
    where: { userId: session.user.id },
    include: { _count: { select: { items: true } } },
  });

  return wishlist?._count.items ?? 0;
}

// Check if a product is in the user's wishlist (single query with include)
export async function isInWishlist(productId: string) {
  const session = await getAuthSession();
  if (!session?.user?.id) return false;

  const wishlist = await prisma.wishlist.findUnique({
    where: { userId: session.user.id },
    include: {
      items: {
        where: { productId },
        select: { id: true },
        take: 1,
      },
    },
  });

  return (wishlist?.items.length ?? 0) > 0;
}

// Get all product IDs in the user's wishlist (batch query to avoid N+1)
export async function getWishlistProductIds(): Promise<Set<string>> {
  const session = await getAuthSession();
  if (!session?.user?.id) return new Set();

  const wishlist = await prisma.wishlist.findUnique({
    where: { userId: session.user.id },
    include: { items: { select: { productId: true } } },
  });

  if (!wishlist) return new Set();
  return new Set(wishlist.items.map((item) => item.productId));
}

// Toggle wishlist item (single-query approach: upsert wishlist + check + add/remove)
export async function toggleWishlist(productId: string) {
  try {
    const t = await getTranslations("Actions");
    const session = await getAuthSession();

    if (!session?.user?.id) {
      throw new Error(t("userNotAuthenticated"));
    }

    // Upsert wishlist and check item in single flow
    const wishlist = await prisma.wishlist.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id },
      update: {},
      include: {
        items: {
          where: { productId },
          select: { id: true },
          take: 1,
        },
      },
    });

    if (wishlist.items.length > 0) {
      // Remove from wishlist
      await prisma.wishlistItem.delete({
        where: {
          wishlistId_productId: {
            wishlistId: wishlist.id,
            productId,
          },
        },
      });
      revalidatePath("/user/wishlist");
      revalidatePath("/en/user/wishlist");
      revalidateTag("wishlist", "max");
      return { success: true, message: t("removedFromWishlist") };
    } else {
      // Add to wishlist
      const product = await prisma.product.findFirst({
        where: { id: productId },
        select: { name: true, nameEn: true },
      });
      if (!product) throw new Error(t("productNotFound"));

      await prisma.wishlistItem.create({
        data: {
          wishlistId: wishlist.id,
          productId,
        },
      });
      revalidatePath("/user/wishlist");
      revalidatePath("/en/user/wishlist");
      revalidateTag("wishlist", "max");
      const locale = await getLocale();
      return { success: true, message: t("addedToWishlist", { name: localizedName(product, locale) }) };
    }
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
