// Shared pricing logic — plain server-only module (NOT "use server").
// Used by cart actions (cart totals), updateUserAddress (recompute on shipping
// method selection) and createOrder (authoritative totals for the order).

import { prisma } from "@/db/prisma";
import { CartItem } from "@/types";
import { round2 } from "./utils";

export type CouponData = {
  discountType: string;
  discountValue: string | number;
  minOrderAmount?: string | number | null;
  maxDiscount?: string | number | null;
} | null;

export async function getCouponData(
  couponCode: string | null | undefined
): Promise<CouponData> {
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

/** Flat shipping cost for the chosen method (before the free-shipping threshold). */
export function shippingCostFor(shippingMethod?: string | null): number {
  if (shippingMethod === "boxnow_locker") {
    return Number(process.env.SHIPPING_COST_BOXNOW ?? 3);
  }
  // Carrier shipping (ACS/Geniki/KTEL — arranged individually) is the default.
  return Number(process.env.SHIPPING_COST ?? 10);
}

// Calculate prices with optional coupon discount and shipping method.
// Without a shippingMethod (cart page, before checkout) the carrier rate is
// used as the conservative estimate.
export const calcPrice = (
  items: CartItem[],
  coupon?: CouponData,
  shippingMethod?: string | null
) => {
  // Greek VAT: standard 24%, reduced 13%/6%. Configurable via env for flexibility.
  const VAT_RATE = Number(process.env.VAT_RATE ?? 0.24);
  const FREE_SHIPPING_THRESHOLD = Number(
    process.env.FREE_SHIPPING_THRESHOLD ?? 100
  );

  const itemsPrice = round2(
      items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0)
    ),
    shippingPrice = round2(
      itemsPrice >= FREE_SHIPPING_THRESHOLD
        ? 0
        : shippingCostFor(shippingMethod)
    ),
    // Catalog prices are FINAL (VAT-inclusive) — taxPrice is the VAT already
    // contained in itemsPrice, shown for information; it is NOT added to the total.
    taxPrice = round2(itemsPrice - itemsPrice / (1 + VAT_RATE));

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

  const totalPrice = round2(itemsPrice + shippingPrice - discountAmount);

  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice: taxPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
    discountAmount: discountAmount.toFixed(2),
  };
};
