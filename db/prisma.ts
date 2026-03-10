import { PrismaClient } from "@prisma/client";

// Extends the PrismaClient with a custom result transformer to convert the price and rating fields to strings.
export const prisma = new PrismaClient().$extends({
  result: {
    product: {
      price: {
        compute(product) {
          return product.price.toString();
        },
      },
      rating: {
        compute(product) {
          return product.rating.toString();
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
