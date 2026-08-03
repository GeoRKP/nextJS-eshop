"use server";

import { cache } from "react";
import { cookies } from "next/headers";
import { CartItem } from "@/types";
import { formatCurrency, formatError, toPlainObject } from "../utils";
import { getAuthSession } from "@/lib/auth-session";
import { prisma } from "@/db/prisma";
import { createCartItemSchema, insertCartSchema } from "../validators";
import { revalidatePath, revalidateTag } from "next/cache";
import { Prisma } from "@prisma/client";
import { getTranslations, getLocale } from "next-intl/server";
import { localizedName } from "@/lib/i18n-helpers";
import { calcPrice, getCouponData } from "../pricing";

export async function addItemToCart(data: CartItem) {
  try {
    const t = await getTranslations("Actions");
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;

    if (!sessionCartId) throw new Error(t("cartSessionNotFound"));

    const session = await getAuthSession();
    const userId = session?.user?.id ? (session.user.id as string) : undefined;

    const cart = await getMyCart();

    const tV = await getTranslations("Validation");
    const clientItem = createCartItemSchema(tV).parse(data);

    // SECURITY: never trust client-provided price/name/image.
    // Re-fetch from DB and override — protects against DevTools price manipulation.
    const product = await prisma.product.findFirst({
      where: {
        id: clientItem.productId,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        nameEn: true,
        slug: true,
        images: true,
        price: true,
        stock: true,
        allowBackorder: true,
      },
    });

    if (!product) throw new Error(t("productNotFound"));

    const item = {
      ...clientItem,
      name: product.name,
      nameEn: product.nameEn,
      slug: product.slug,
      image: product.images[0] ?? clientItem.image,
      price: product.price.toString(),
    };

    if (!cart) {
      // Never let the first add exceed available stock (client qty is untrusted).
      // Backorder products are purchasable regardless of stock.
      if (!product.allowBackorder && product.stock < clientItem.qty) {
        throw new Error(t("notEnoughStock"));
      }

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

      const locale = await getLocale();
      return {
        success: true,
        message: t("addedToCart", { name: localizedName(product, locale) }),
      };
    } else {
      // Check if the item is already in the cart
      const existItem = (cart.items as CartItem[]).find(
        (x) => x.productId === item.productId
      );

      if (existItem) {
        if (!product.allowBackorder && product.stock < existItem.qty + 1) {
          throw new Error(t("notEnoughStock"));
        }

        // Increase the quantity of the existing item

        (cart.items as CartItem[]).find(
          (x) => x.productId === item.productId
        )!.qty = existItem.qty + 1;
      } else {
        if (!product.allowBackorder && product.stock < clientItem.qty) {
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

      const locale = await getLocale();
      const displayName = localizedName(product, locale);
      return {
        success: true,
        message: existItem
          ? t("updatedInCart", { name: displayName })
          : t("addedToCart", { name: displayName }),
      };
    }
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

// React cache(): the header menu and the page body both call this on most pages —
// memoize per request so the cart resolves once.
export const getMyCart = cache(async () => {
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

    // Guest-cart claim/merge only when this browser session isn't linked to the
    // user cart yet (fresh login, or a different browser). The steady state —
    // cart.sessionCartId matches the cookie — costs a single SELECT per request.
    if (!cart || cart.sessionCartId !== sessionCartId) {
      const guestCart = await prisma.cart.findFirst({
        where: { sessionCartId, userId: null },
      });

      if (!guestCart) {
        // Nothing to merge — link the user cart to this browser session so the
        // guest lookup is skipped on subsequent requests.
        if (cart) {
          cart = await prisma.cart.update({
            where: { id: cart.id },
            data: { sessionCartId },
          });
        }
      } else if (!cart) {
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

        // Clamp merged quantities to available stock (guest + user carts may
        // together exceed it) and drop items that are out of stock entirely.
        // Backorder products are exempt from both the clamp and the drop.
        const stocks = await prisma.product.findMany({
          where: { id: { in: userItems.map((i) => i.productId) } },
          select: { id: true, stock: true, allowBackorder: true },
        });
        const productById = new Map(stocks.map((p) => [p.id, p]));
        const mergedItems = userItems.filter((item) => {
          const p = productById.get(item.productId);
          if (!p) return false;
          if (p.allowBackorder) return true;
          if (p.stock <= 0) return false;
          if (item.qty > p.stock) item.qty = p.stock;
          return true;
        });

        const couponData = await getCouponData(cart.couponCode);

        cart = await prisma.cart.update({
          where: { id: cart.id },
          data: {
            items: mergedItems as Prisma.CartUpdateitemsInput[],
            sessionCartId,
            ...calcPrice(mergedItems, couponData),
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
});

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
      select: { id: true, slug: true, name: true, nameEn: true },
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

    const locale = await getLocale();
    const displayName = localizedName(product, locale);
    return {
      success: true,
      message: exist.qty === 1
        ? t("removedFromCart", { name: displayName })
        : t("updatedInCart", { name: displayName }),
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

    // calcPrice silently skips the discount below the minimum, so without this
    // the cart reported "coupon applied" while charging full price.
    if (
      coupon.minOrderAmount &&
      Number(cart.itemsPrice) < Number(coupon.minOrderAmount)
    ) {
      throw new Error(
        t("couponMinOrderNotMet", {
          amount: formatCurrency(Number(coupon.minOrderAmount)),
        })
      );
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
