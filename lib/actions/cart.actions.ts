"use server";

import { cookies } from "next/headers";
import { CartItem } from "@/types";
import { formatError, round2, toPlainObject } from "../utils";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { cartItemSchema, insertCartSchema } from "../validators";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { getTranslations } from "next-intl/server";

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
  const itemsPrice = round2(
      items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0)
    ),
    shippingPrice = round2(itemsPrice > 100 ? 0 : 10),
    taxPrice = round2(itemsPrice * 0.15);

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

    const session = await auth();
    const userId = session?.user?.id ? (session.user.id as string) : undefined;

    const cart = await getMyCart();

    const item = cartItemSchema.parse(data);

    const product = await prisma.product.findFirst({
      where: {
        id: item.productId,
      },
    });

    if (!product) throw new Error(t("productNotFound"));

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

      // Get coupon data if cart has one applied
      let couponData = null;
      if (cart.couponCode) {
        const coupon = await prisma.coupon.findUnique({
          where: { code: cart.couponCode },
        });
        if (coupon) {
          couponData = {
            discountType: coupon.discountType,
            discountValue: coupon.discountValue.toString(),
            minOrderAmount: coupon.minOrderAmount?.toString(),
            maxDiscount: coupon.maxDiscount?.toString(),
          };
        }
      }

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

  if (!sessionCartId) throw new Error("Cart session not found");

  const session = await auth();
  const userId = session?.user?.id ? (session.user.id as string) : undefined;

  const cart = await prisma.cart.findFirst({
    where: userId ? { userId: userId } : { sessionCartId: sessionCartId },
  });

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

    // Get coupon data if cart has one applied
    let couponData = null;
    if (cart.couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: cart.couponCode },
      });
      if (coupon) {
        couponData = {
          discountType: coupon.discountType,
          discountValue: coupon.discountValue.toString(),
          minOrderAmount: coupon.minOrderAmount?.toString(),
          maxDiscount: coupon.maxDiscount?.toString(),
        };
      }
    }

    // Update cart in db
    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: cart.items as Prisma.CartUpdateitemsInput[],
        ...calcPrice(cart.items as CartItem[], couponData),
      },
    });

    revalidatePath(`/product/${product.slug}`);

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
    const session = await auth();
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
    revalidatePath("/place-order");

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
    revalidatePath("/place-order");

    return { success: true, message: t("couponRemoved") };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
