import {
  cartItemSchema,
  insertCartSchema,
  shippingAddressSchema,
  insertOrderSchema,
  insertOrderItemSchema,
  insertProductSchema,
  paymentResultSchema,
  insertCategorySchema,
  insertAddressSchema,
  insertCouponSchema,
} from "@/lib/validators";
import { z } from "zod/v3";

export type Product = z.infer<typeof insertProductSchema> & {
  id: string;
  createdAt: Date;
  deletedAt?: Date | null;
  categoryId?: string | null;
};

export type Cart = z.infer<typeof insertCartSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;
export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
export type Order = Omit<z.infer<typeof insertOrderSchema>, "shippingMethod"> & {
  id: string;
  createdAt: Date;
  isPaid: boolean;
  paidAt: Date | null;
  isDelivered: boolean;
  deliveredAt: Date | null;
  status: string;
  orderitems: OrderItem[];
  user: {
    name: string;
    email: string;
  };
  statusHistory?: OrderStatusHistory[];
  // Read side: the DB stores plain text, so widen the insert schema's enum.
  shippingMethod?: string | null;
  // Box Now fulfillment (DB columns, not part of the insert schema)
  boxnowLocker?: unknown;
  boxnowReferenceNumber?: string | null;
  boxnowParcelIds?: string[];
  boxnowStatus?: string | null;
};
export type OrderItem = z.infer<typeof insertOrderItemSchema>;
export type PaymentResult = z.infer<typeof paymentResultSchema>;

// ── Category types ──

export type Category = z.infer<typeof insertCategorySchema> & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  children?: Category[];
  parent?: Category | null;
  _count?: { products: number };
};

// ── Address types ──

export type Address = z.infer<typeof insertAddressSchema> & {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

// ── Wishlist types ──

export type WishlistItem = {
  id: string;
  wishlistId: string;
  productId: string;
  addedAt: Date;
  product: Product;
};

export type Wishlist = {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  items: WishlistItem[];
};

// ── Coupon types ──

export type Coupon = z.infer<typeof insertCouponSchema> & {
  id: string;
  usedCount: number;
  createdAt: Date;
  updatedAt: Date;
};

export type CouponUsage = {
  id: string;
  couponId: string;
  userId: string;
  orderId: string;
  usedAt: Date;
};

// ── Order status types ──

export type OrderStatusHistory = {
  id: string;
  orderId: string;
  status: string;
  note: string | null;
  changedBy: string | null;
  createdAt: Date;
};

// ── Return Request types ──

export type ReturnRequest = {
  id: string;
  orderId: string;
  userId: string;
  status: string;
  reason: string;
  description: string | null;
  images: string[];
  refundAmount: string | null;
  refundMethod: string | null;
  adminNote: string | null;
  resolvedBy: string | null;
  resolvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

// ── Notification types ──

export type Notification = {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
};
