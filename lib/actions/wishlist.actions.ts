"use server";

import { prisma } from "@/db/prisma";
import { auth } from "@/auth";
import { formatError, toPlainObject } from "../utils";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";

// Get the current user's wishlist
export async function getMyWishlist() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const wishlist = await prisma.wishlist.findUnique({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: true,
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
  const session = await auth();
  if (!session?.user?.id) return 0;

  const wishlist = await prisma.wishlist.findUnique({
    where: { userId: session.user.id },
    include: { _count: { select: { items: true } } },
  });

  return wishlist?._count.items ?? 0;
}

// Check if a product is in the user's wishlist
export async function isInWishlist(productId: string) {
  const session = await auth();
  if (!session?.user?.id) return false;

  const wishlist = await prisma.wishlist.findUnique({
    where: { userId: session.user.id },
  });

  if (!wishlist) return false;

  const item = await prisma.wishlistItem.findUnique({
    where: {
      wishlistId_productId: {
        wishlistId: wishlist.id,
        productId,
      },
    },
  });

  return !!item;
}

// Get all product IDs in the user's wishlist (batch query to avoid N+1)
export async function getWishlistProductIds(): Promise<Set<string>> {
  const session = await auth();
  if (!session?.user?.id) return new Set();

  const wishlist = await prisma.wishlist.findUnique({
    where: { userId: session.user.id },
    include: { items: { select: { productId: true } } },
  });

  if (!wishlist) return new Set();
  return new Set(wishlist.items.map((item) => item.productId));
}

// Add product to wishlist
export async function addToWishlist(productId: string) {
  try {
    const t = await getTranslations("Actions");
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error(t("userNotAuthenticated"));
    }

    const product = await prisma.product.findFirst({
      where: { id: productId },
    });

    if (!product) throw new Error(t("productNotFound"));

    // Get or create wishlist
    let wishlist = await prisma.wishlist.findUnique({
      where: { userId: session.user.id },
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { userId: session.user.id },
      });
    }

    // Check if already in wishlist
    const existing = await prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId,
        },
      },
    });

    if (existing) {
      return { success: true, message: t("alreadyInWishlist") };
    }

    await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId,
      },
    });

    revalidatePath("/user/wishlist");

    return { success: true, message: t("addedToWishlist", { name: product.name }) };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Remove product from wishlist
export async function removeFromWishlist(productId: string) {
  try {
    const t = await getTranslations("Actions");
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error(t("userNotAuthenticated"));
    }

    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: session.user.id },
    });

    if (!wishlist) {
      throw new Error(t("wishlistNotFound"));
    }

    await prisma.wishlistItem.delete({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId,
        },
      },
    });

    revalidatePath("/user/wishlist");

    return { success: true, message: t("removedFromWishlist") };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Toggle wishlist item
export async function toggleWishlist(productId: string) {
  const inWishlist = await isInWishlist(productId);

  if (inWishlist) {
    return removeFromWishlist(productId);
  } else {
    return addToWishlist(productId);
  }
}
