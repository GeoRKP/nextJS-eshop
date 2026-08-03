import { PrismaClient } from "@prisma/client";

function createPrismaClient() {
  const url = process.env.DATABASE_URL ?? "";
  const isNeon = url.includes("neon.tech") || url.includes("neon.db");

  if (isNeon) {
    // Dynamic imports are not needed — these are only loaded when Neon is used
     
    const { Pool, neonConfig } = require("@neondatabase/serverless");
     
    const { PrismaNeon } = require("@prisma/adapter-neon");
     
    const ws = require("ws");

    neonConfig.webSocketConstructor = ws;
    const pool = new Pool({ connectionString: url });
    const adapter = new PrismaNeon(pool);
    return new PrismaClient({ adapter });
  }

  return new PrismaClient();
}

// Extends the PrismaClient with a custom result transformer to convert the price fields to strings.
export const prisma = createPrismaClient().$extends({
  result: {
    product: {
      price: {
        compute(product) {
          return product.price.toString();
        },
      },
    },
    cart: {
      itemsPrice: {
        needs: { itemsPrice: true },
        compute(cart) {
          return cart.itemsPrice.toString();
        },
      },
      shippingPrice: {
        needs: { shippingPrice: true },
        compute(cart) {
          return cart.shippingPrice.toString();
        },
      },
      taxPrice: {
        needs: { taxPrice: true },
        compute(cart) {
          return cart.taxPrice.toString();
        },
      },
      totalPrice: {
        needs: { totalPrice: true },
        compute(cart) {
          return cart.totalPrice.toString();
        },
      },
      discountAmount: {
        needs: { discountAmount: true },
        compute(cart) {
          return cart.discountAmount.toString();
        },
      },
    },
    order: {
      itemsPrice: {
        needs: { itemsPrice: true },
        compute(order) {
          return order.itemsPrice.toString();
        },
      },
      shippingPrice: {
        needs: { shippingPrice: true },
        compute(order) {
          return order.shippingPrice.toString();
        },
      },
      taxPrice: {
        needs: { taxPrice: true },
        compute(order) {
          return order.taxPrice.toString();
        },
      },
      totalPrice: {
        needs: { totalPrice: true },
        compute(order) {
          return order.totalPrice.toString();
        },
      },
      discountAmount: {
        needs: { discountAmount: true },
        compute(order) {
          return order.discountAmount.toString();
        },
      },
    },
    orderItem: {
      price: {
        compute(item) {
          return item.price.toString();
        },
      },
    },
    coupon: {
      discountValue: {
        needs: { discountValue: true },
        compute(coupon) {
          return coupon.discountValue.toString();
        },
      },
      minOrderAmount: {
        needs: { minOrderAmount: true },
        compute(coupon) {
          return coupon.minOrderAmount?.toString() ?? null;
        },
      },
      maxDiscount: {
        needs: { maxDiscount: true },
        compute(coupon) {
          return coupon.maxDiscount?.toString() ?? null;
        },
      },
    },
    returnRequest: {
      refundAmount: {
        needs: { refundAmount: true },
        compute(req) {
          return req.refundAmount?.toString() ?? null;
        },
      },
    },
  },
});
