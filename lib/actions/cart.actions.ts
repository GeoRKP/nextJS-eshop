"use server";

import { cookies } from "next/headers";
import { CartItem } from "@/types";
import { formatError, round2, toPlainObject } from "../utils";
import { getAuthSession } from "@/lib/auth-session";
import { prisma } from "@/db/prisma";
import { cartItemSchema, insertCartSchema } from "../validators";
import { revalidatePath, revalidateTag } from "next/cache";
import { Prisma } from "@prisma/client";
import { getTranslations } from "next-intl/server";

// Helper to get coupon data for price recalculation
async function getCouponData(couponCode: string | null | undefined) {
  if (!couponCode) return null;
  const coupon = await prisma.coupon.findUnique({
    where: { code: couponCode },
  });
  if (!coupon) return null;
  return {
    discountType: coupon.discountType,
    discountValue: coupon.discountValue.toString(),
    minOrderAmount: coupon.minOrderAmount?.toString(),
    maxDiscount: coupon.maxDiscount?.toString(),
  };
}

// Calculate prices with optional coupon discount
const calcPrice = (
  items: CartItem[],
  coupon?: {
    discountType: string;
    discountValue: string | number;
    minOrderAmount?: string | number | null;
    maxDiscount?: string | number | null;
  } | null
) => {
  // Greek VAT: standard 24%, reduced 13%/6%. Configurable via env for flexibility.
  const VAT_RATE = Number(process.env.VAT_RATE ?? 0.24);
  const FREE_SHIPPING_THRESHOLD = Number(
    process.env.FREE_SHIPPING_THRESHOLD ?? 100
  );
  const SHIPPING_COST = Number(process.env.SHIPPING_COST ?? 10);

  const itemsPrice = round2(
      items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0)
    ),
    shippingPrice = round2(
      itemsPrice >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
    ),
    taxPrice = round2(itemsPrice * VAT_RATE);

  // Calculate discount
  let discountAmount = 0;

  if (coupon) {
    // Check minimum order amount
    if (coupon.minOrderAmount && itemsPrice < Number(coupon.minOrderAmount)) {
      // Don't apply discount if below minimum
    } else if (coupon.discountType === "percentage") {
      discountAmount = round2(itemsPrice * (Number(coupon.discountValue) / 100));
      // Apply max discount cap
      if (coupon.maxDiscount && discountAmount > Number(coupon.maxDiscount)) {
        discountAmount = round2(Number(coupon.maxDiscount));
      }
    } else if (coupon.discountType === "fixed_amount") {
      discountAmount = round2(Math.min(Number(coupon.discountValue), itemsPrice));
    } else if (coupon.discountType === "free_shipping") {
      discountAmount = shippingPrice;
    }
  }

  const totalPrice = round2(
    itemsPrice + shippingPrice + taxPrice - discountAmount
  );

  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice: taxPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
    discountAmount: discountAmount.toFixed(2),
  };
};

export async function addItemToCart(data: CartItem) {
  try {
    const t = await getTranslations("Actions");
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;

    if (!sessionCartId) throw new Error(t("cartSessionNotFound"));

    const session = await getAuthSession();
    const userId = session?.user?.id ? (session.user.id as string) : undefined;

    const cart = await getMyCart();

    const clientItem = cartItemSchema.parse(data);

    // SECURITY: never trust client-provided price/name/image.
    // Re-fetch from DB and override — protects against DevTools price manipulation.
    const product = await prisma.product.findFirst({
      where: {
        id: clientItem.productId,
        deletedAt: null,
      },
    });

    if (!product) throw new Error(t("productNotFound"));

    const item = {
      ...clientItem,
      name: product.name,
      slug: product.slug,
      image: product.images[0] ?? clientItem.image,
      price: product.price.toString(),
    };

    if (!cart) {
      const newCart = insertCartSchema.parse({
        userId: userId,
        items: [item],
        sessionCartId: sessionCartId,
        ...calcPrice([item]),
      });

      await prisma.cart.create({
        data: newCart,
      });

      revalidatePath(`/product/${product.slug}`);
      revalidatePath(`/en/product/${product.slug}`);
      revalidatePath("/cart");
      revalidatePath("/en/cart");
      revalidateTag("cart", "max");

      return {
        success: true,
        message: t("addedToCart", { name: product.name }),
      };
    } else {
      // Check if the item is already in the cart
      const existItem = (cart.items as CartItem[]).find(
        (x) => x.productId === item.productId
      );

      if (existItem) {
        if (product.stock < existItem.qty + 1) {
          throw new Error(t("notEnoughStock"));
        }

        // Increase the quantity of the existing item

        (cart.items as CartItem[]).find(
          (x) => x.productId === item.productId
        )!.qty = existItem.qty + 1;
      } else {
        if (product.stock < 1) {
          throw new Error(t("notEnoughStock"));
        }

        cart.items.push(item);
      }

      const couponData = await getCouponData(cart.couponCode);

      await prisma.cart.update({
        where: {
          id: cart.id,
        },
        data: {
          items: cart.items as Prisma.CartUpdateitemsInput[],
          ...calcPrice(cart.items as CartItem[], couponData),
        },
      });

      revalidatePath(`/product/${product.slug}`);
      revalidatePath(`/en/product/${product.slug}`);
      revalidatePath("/cart");
      revalidatePath("/en/cart");
      revalidateTag("cart", "max");

      return {
        success: true,
        message: existItem
          ? t("updatedInCart", { name: product.name })
          : t("addedToCart", { name: product.name }),
      };
    }
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function getMyCart() {
  const sessionCartId = (await cookies()).get("sessionCartId")?.value;

  if (!sessionCartId) {
    const t = await getTranslations("Actions");
    throw new Error(t("cartSessionNotFound"));
  }

  const session = await getAuthSession();
  const userId = session?.user?.id ? (session.user.id as string) : undefined;

  let cart;

  if (userId) {
    // Logged-in user: look for their cart first
    cart = await prisma.cart.findFirst({ where: { userId } });

    // Check for a guest cart that should be claimed/merged
    const guestCart = await prisma.cart.findFirst({
      where: { sessionCartId, userId: null },
    });

    if (guestCart) {
      if (!cart) {
        // No user cart exists — claim the guest cart
        cart = await prisma.cart.update({
          where: { id: guestCart.id },
          data: { userId },
        });
      } else {
        // Both exist — merge guest items into user cart
        const userItems = cart.items as CartItem[];
        const guestItems = guestCart.items as CartItem[];

        for (const guestItem of guestItems) {
          const existing = userItems.find(
            (i) => i.productId === guestItem.productId
          );
          if (existing) {
            existing.qty += guestItem.qty;
          } else {
            userItems.push(guestItem);
          }
        }

        const couponData = await getCouponData(cart.couponCode);

        cart = await prisma.cart.update({
          where: { id: cart.id },
          data: {
            items: userItems as Prisma.CartUpdateitemsInput[],
            ...calcPrice(userItems, couponData),
          },
        });

        // Delete the guest cart
        await prisma.cart.delete({ where: { id: guestCart.id } });
      }
    }
  } else {
    // Guest user: find by sessionCartId
    cart = await prisma.cart.findFirst({ where: { sessionCartId } });
  }

  if (!cart) return undefined;

  return toPlainObject({
    ...cart,
    items: cart.items as CartItem[],
    itemsPrice: cart.itemsPrice.toString(),
    totalPrice: cart.totalPrice.toString(),
    shippingPrice: cart.shippingPrice.toString(),
    taxPrice: cart.taxPrice.toString(),
    discountAmount: cart.discountAmount.toString(),
  });
}

export async function removeItemFromCart(productId: string) {
  try {
    const t = await getTranslations("Actions");
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;

    if (!sessionCartId) throw new Error(t("cartSessionNotFound"));

    // Get product
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
      },
    });

    if (!product) throw new Error(t("productNotFound"));

    // Get user cart
    const cart = await getMyCart();

    if (!cart) throw new Error(t("cartNotFound"));

    // Check if the item is in the cart
    const exist = (cart.items as CartItem[]).find(
      (x) => x.productId === productId
    );

    if (!exist) throw new Error(t("itemNotFoundInCart"));

    // Check if only one item in cart
    if (exist.qty === 1) {
      // Delete from cart
      cart.items = (cart.items as CartItem[]).filter(
        (x) => x.productId !== exist.productId
      );
    } else {
      // Decrease quantity
      (cart.items as CartItem[]).find(
        (x) => x.productId === productId
      )!.qty = exist.qty - 1;
    }

    const couponData = await getCouponData(cart.couponCode);

    // Update cart in db
    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: cart.items as Prisma.CartUpdateitemsInput[],
        ...calcPrice(cart.items as CartItem[], couponData),
      },
    });

    revalidatePath(`/product/${product.slug}`);
    revalidatePath(`/en/product/${product.slug}`);
    revalidatePath("/cart");
    revalidatePath("/en/cart");
    revalidateTag("cart", "max");

    return {
      success: true,
      message: exist.qty === 1
        ? t("removedFromCart", { name: product.name })
        : t("updatedInCart", { name: product.name }),
    };

  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

// Apply coupon to cart
export async function applyCouponToCart(code: string) {
  try {
    const t = await getTranslations("Actions");
    const cart = await getMyCart();

    if (!cart) throw new Error(t("cartNotFound"));

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) throw new Error(t("couponNotFound"));
    if (!coupon.isActive) throw new Error(t("couponInactive"));

    const now = new Date();
    if (coupon.validFrom > now) throw new Error(t("couponNotYetValid"));
    if (coupon.validUntil && coupon.validUntil < now) throw new Error(t("couponExpired"));
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) throw new Error(t("couponMaxUsesReached"));

    // Check per-user usage
    const session = await getAuthSession();
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

    const couponData = {
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      minOrderAmount: coupon.minOrderAmount?.toString(),
      maxDiscount: coupon.maxDiscount?.toString(),
    };

    const prices = calcPrice(cart.items as CartItem[], couponData);

    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        couponCode: coupon.code,
        ...prices,
      },
    });

    revalidatePath("/cart");
    revalidatePath("/en/cart");
    revalidatePath("/place-order");
    revalidatePath("/en/place-order");
    revalidateTag("cart", "max");

    return {
      success: true,
      message: t("couponApplied"),
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Remove coupon from cart
export async function removeCouponFromCart() {
  try {
    const t = await getTranslations("Actions");
    const cart = await getMyCart();

    if (!cart) throw new Error(t("cartNotFound"));

    const prices = calcPrice(cart.items as CartItem[]);

    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        couponCode: null,
        ...prices,
      },
    });

    revalidatePath("/cart");
    revalidatePath("/en/cart");
    revalidatePath("/place-order");
    revalidatePath("/en/place-order");
    revalidateTag("cart", "max");

    return { success: true, message: t("couponRemoved") };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
