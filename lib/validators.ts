import { z } from "zod/v3";
import { formatNumberWithDecimal } from "./utils";
import { PAYMENT_METHODS, USER_ROLES } from "./constants";

// Translation function type — compatible with both useTranslations and getTranslations
 
type T = (key: string, values?: any) => string;

const currency = z
  .string()
  .refine(
    (value) => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(Number(value))),
    "Price must have exact two decimal places"
  );

const createCurrency = (t: T) =>
  z
    .string()
    .refine(
      (value) =>
        /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(Number(value))),
      t("priceDecimal")
    );

// ── Order status constants ──

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refund_requested",
  "refunded",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

// ── Coupon discount type constants ──

export const COUPON_DISCOUNT_TYPES = [
  "percentage",
  "fixed_amount",
  "free_shipping",
] as const;

export type CouponDiscountType = (typeof COUPON_DISCOUNT_TYPES)[number];

// ── Base schemas (for type inference) ──

//Schema for creating a product

export const insertProductSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters long" }),
  nameEn: z.string().optional().nullable(),
  slug: z
    .string()
    .min(3, { message: "Slug must be at least 3 characters long" }),
  category: z
    .string()
    .min(3, { message: "Category must be at least 3 characters long" }),
  categoryId: z.string().uuid().optional().nullable(),
  brand: z
    .string()
    .min(3, { message: "Brand must be at least 3 characters long" }),
  description: z
    .string()
    .min(3, { message: "Description must be at least 3 characters long" }),
  descriptionEn: z.string().optional().nullable(),
  stock: z.coerce.number().min(0, { message: "Stock must be at least 0" }),
  images: z
    .array(z.string())
    .min(1, { message: "At least one image is required" }),
  isFeatured: z.boolean(),
  banner: z.string().nullable(),
  price: currency,
});

// Schema for updating a product

export const updateProductSchema = insertProductSchema.extend({
  id: z.string().min(1, { message: "Id is required" }),
});

// Schema for signing user in

export const signInFormSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
});

// Schema for signing user up
export const signUpFormSchema = z
  .object({
    name: z.string().min(3, { message: "Name must be at least 3 characters" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" }),
    confirmPassword: z.string().min(8, {
      message: "Confirm password must be at least 8 characters long",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match",
  });

// Cart Schemas

export const cartItemSchema = z.object({
  productId: z.string().min(1, { message: "Product is required" }),
  name: z.string().min(1, { message: "Name is required" }),
  slug: z.string().min(1, { message: "Slug is required" }),
  qty: z
    .number()
    .int()
    .positive({ message: "Quantity must be a positive number" }),
  image: z.string().min(1, { message: "Image is required" }),
  price: currency,
});

export const insertCartSchema = z.object({
  items: z.array(cartItemSchema),
  itemsPrice: currency,
  totalPrice: currency,
  shippingPrice: currency,
  taxPrice: currency,
  sessionCartId: z.string().min(1, { message: "Session cart id is required" }),
  userId: z.string().optional().nullable(),
  couponCode: z.string().optional().nullable(),
  discountAmount: currency.optional().default("0.00"),
});

// Snapshot of a selected Box Now APM locker (stored in the address / order JSON).
export const boxnowLockerSchema = z.object({
  id: z.string().min(1),
  name: z.string().optional(),
  addressLine1: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  lat: z.number().optional().nullable(),
  lng: z.number().optional().nullable(),
});

export const SHIPPING_METHODS = ["home", "boxnow_locker"] as const;

export const shippingAddressSchema = z.object({
  fullName: z
    .string()
    .min(3, { message: "Full name must be at least 3 characters long" }),
  address: z
    .string()
    .min(3, { message: "Address must be at least 3 characters long" }),
  city: z
    .string()
    .min(3, { message: "City must be at least 3 characters long" }),
  postalCode: z
    .string()
    .min(3, { message: "Postal code must be at least 3 characters long" }),
  country: z
    .string()
    .min(3, { message: "Country must be at least 3 characters long" }),
  phone: z.string().optional().nullable(),
  shippingMethod: z.enum(SHIPPING_METHODS).optional().nullable(),
  boxnowLocker: boxnowLockerSchema.optional().nullable(),
  lat: z.number().optional().nullable(),
  lng: z.number().optional().nullable(),
});

export const paymentMethodSchema = z
  .object({
    type: z.string().min(1, "Payment method is required"),
  })
  .refine((data) => PAYMENT_METHODS.includes(data.type), {
    path: ["type"],
    message: "Invalid payment method",
  });

// Schema for inserting an order

export const insertOrderSchema = z.object({
  userId: z.string().min(1, { message: "User is required" }),
  itemsPrice: currency,
  shippingPrice: currency,
  taxPrice: currency,
  totalPrice: currency,
  paymentMethod: z.string().refine((data) => PAYMENT_METHODS.includes(data), {
    message: "Invalid payment method",
  }),
  shippingAddress: shippingAddressSchema,
  shippingMethod: z.enum(SHIPPING_METHODS).optional().nullable(),
  couponId: z.string().uuid().optional().nullable(),
  couponCode: z.string().optional().nullable(),
  discountAmount: currency.optional().default("0.00"),
});

// Schema for inserting an order item

export const insertOrderItemSchema = z.object({
  productId: z.string(),
  slug: z.string(),
  image: z.string(),
  name: z.string(),
  price: currency,
  qty: z.number(),
});

export const paymentResultSchema = z.object({
  id: z.string(),
  status: z.string(),
  email_address: z.string(),
  pricePaid: z.string(),
});

// Schema for updating the user profile

export const updateUserProfileSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters long" }),
  email: z.string().email({ message: "Invalid email address" }),
});

// Update User Schema

export const updateUserSchema = updateUserProfileSchema.extend({
  id: z.string().min(1, { message: "Id is required" }),
  // Constrain to known roles so an arbitrary role value can't be written.
  // Kept as `string` (not z.enum) so the inferred form type stays compatible
  // with the DB user; the refine still rejects out-of-set values at parse time.
  role: z
    .string()
    .min(1, { message: "Role is required" })
    .refine((v) => USER_ROLES.includes(v), { message: "Invalid role" }),
});

// Schema for inserting a review

export const insertReviewSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters long" }),
  description: z.string().min(3, { message: "Description must be at least 3 characters long" }),
  productId: z.string().min(1, { message: "Product is required" }),
  userId: z.string().min(1, { message: "User is required" }),
  rating: z.coerce.number().int().min(1, { message: "Rating must be at least 1" }).max(5, { message: "Rating must be at most 5" }),
});

// ── Category schemas ──

export const insertCategorySchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
  nameEn: z.string().optional().nullable(),
  slug: z.string().min(2, { message: "Slug must be at least 2 characters long" }),
  description: z.string().optional().nullable(),
  descriptionEn: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  parentId: z.string().uuid().optional().nullable(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const updateCategorySchema = insertCategorySchema.extend({
  id: z.string().min(1, { message: "Id is required" }),
});

// ── Address schemas ──

export const insertAddressSchema = z.object({
  label: z.string().optional().nullable(),
  fullName: z.string().min(3, { message: "Full name must be at least 3 characters long" }),
  phone: z.string().optional().nullable(),
  address: z.string().min(3, { message: "Address must be at least 3 characters long" }),
  address2: z.string().optional().nullable(),
  city: z.string().min(3, { message: "City must be at least 3 characters long" }),
  state: z.string().optional().nullable(),
  postalCode: z.string().min(3, { message: "Postal code must be at least 3 characters long" }),
  country: z.string().min(3, { message: "Country must be at least 3 characters long" }),
  lat: z.number().optional().nullable(),
  lng: z.number().optional().nullable(),
  isDefault: z.boolean().default(false),
});

export const updateAddressSchema = insertAddressSchema.extend({
  id: z.string().min(1, { message: "Id is required" }),
});

// ── Coupon schemas ──

export const insertCouponSchema = z.object({
  code: z.string().min(3, { message: "Code must be at least 3 characters" }).toUpperCase(),
  description: z.string().optional().nullable(),
  discountType: z.enum(["percentage", "fixed_amount", "free_shipping"]),
  discountValue: currency,
  minOrderAmount: currency.optional().nullable(),
  maxDiscount: currency.optional().nullable(),
  maxUses: z.coerce.number().int().positive().optional().nullable(),
  maxUsesPerUser: z.coerce.number().int().positive().default(1),
  validFrom: z.coerce.date(),
  validUntil: z.coerce.date().optional().nullable(),
  isActive: z.boolean().default(true),
  appliesToAll: z.boolean().default(true),
  categoryIds: z.array(z.string().uuid()).optional().default([]),
  productIds: z.array(z.string().uuid()).optional().default([]),
});

export const updateCouponSchema = insertCouponSchema.extend({
  id: z.string().min(1, { message: "Id is required" }),
});

// ── Order status update schema ──

export const updateOrderStatusSchema = z.object({
  orderId: z.string().min(1, { message: "Order ID is required" }),
  status: z.enum(ORDER_STATUSES as unknown as [string, ...string[]]),
  note: z.string().optional().nullable(),
});

// ── Localized schema factory functions ──
// Pass t = useTranslations("Validation") or getTranslations("Validation")

export function createInsertProductSchema(t: T) {
  const cur = createCurrency(t);
  return z.object({
    name: z.string().min(3, { message: t("nameMin") }),
    nameEn: z.string().optional().nullable(),
    slug: z.string().min(3, { message: t("slugMin") }),
    category: z.string().min(3, { message: t("categoryMin") }),
    categoryId: z.string().uuid().optional().nullable(),
    brand: z.string().min(3, { message: t("brandMin") }),
    description: z.string().min(3, { message: t("descriptionMin") }),
    descriptionEn: z.string().optional().nullable(),
    stock: z.coerce.number().min(0, { message: t("stockMin") }),
    images: z.array(z.string()).min(1, { message: t("imagesMin") }),
    isFeatured: z.boolean(),
    banner: z.string().nullable(),
    price: cur,
  });
}

export function createUpdateProductSchema(t: T) {
  return createInsertProductSchema(t).extend({
    id: z.string().min(1, { message: t("idRequired") }),
  });
}

export function createSignInFormSchema(t: T) {
  return z.object({
    email: z.string().email({ message: t("invalidEmail") }),
    password: z.string().min(8, { message: t("passwordMin") }),
  });
}

export function createSignUpFormSchema(t: T) {
  return z
    .object({
      name: z.string().min(3, { message: t("nameMinChars") }),
      email: z.string().email({ message: t("invalidEmail") }),
      password: z.string().min(8, { message: t("passwordMin") }),
      confirmPassword: z.string().min(8, { message: t("confirmPasswordMin") }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      path: ["confirmPassword"],
      message: t("passwordsDontMatch"),
    });
}

export function createShippingAddressSchema(t: T) {
  return z
    .object({
      fullName: z.string().min(3, { message: t("fullNameMin") }),
      address: z.string().min(3, { message: t("addressMin") }),
      city: z.string().min(3, { message: t("cityMin") }),
      postalCode: z.string().min(3, { message: t("postalCodeMin") }),
      country: z.string().min(3, { message: t("countryMin") }),
      phone: z.string().optional().nullable(),
      shippingMethod: z.enum(SHIPPING_METHODS).optional().nullable(),
      boxnowLocker: boxnowLockerSchema.optional().nullable(),
      lat: z.number().optional().nullable(),
      lng: z.number().optional().nullable(),
    })
    // Box Now locker delivery requires a chosen locker and a phone number (for the locker PIN SMS).
    .refine(
      (data) =>
        data.shippingMethod !== "boxnow_locker" || Boolean(data.boxnowLocker?.id),
      { path: ["boxnowLocker"], message: t("lockerRequired") }
    )
    .refine(
      (data) =>
        data.shippingMethod !== "boxnow_locker" ||
        Boolean(data.phone && data.phone.trim().length >= 8),
      { path: ["phone"], message: t("phoneRequired") }
    );
}

export function createPaymentMethodSchema(t: T) {
  return z
    .object({
      type: z.string().min(1, t("paymentMethodRequired")),
    })
    .refine((data) => PAYMENT_METHODS.includes(data.type), {
      path: ["type"],
      message: t("invalidPaymentMethod"),
    });
}

export function createInsertOrderSchema(t: T) {
  const cur = createCurrency(t);
  return z.object({
    userId: z.string().min(1, { message: t("userRequired") }),
    itemsPrice: cur,
    shippingPrice: cur,
    taxPrice: cur,
    totalPrice: cur,
    paymentMethod: z.string().refine((data) => PAYMENT_METHODS.includes(data), {
      message: t("invalidPaymentMethod"),
    }),
    shippingAddress: createShippingAddressSchema(t),
    shippingMethod: z.enum(SHIPPING_METHODS).optional().nullable(),
    couponId: z.string().uuid().optional().nullable(),
    couponCode: z.string().optional().nullable(),
    discountAmount: cur.optional().default("0.00"),
  });
}

export function createUpdateUserProfileSchema(t: T) {
  return z.object({
    name: z.string().min(3, { message: t("nameMin") }),
    email: z.string().email({ message: t("invalidEmail") }),
  });
}

export function createUpdateUserSchema(t: T) {
  return createUpdateUserProfileSchema(t).extend({
    id: z.string().min(1, { message: t("idRequired") }),
    role: z.string().min(1, { message: t("roleRequired") }),
  });
}

export function createInsertReviewSchema(t: T) {
  return z.object({
    title: z.string().min(3, { message: t("titleMin") }),
    description: z.string().min(3, { message: t("descriptionMin") }),
    productId: z.string().min(1, { message: t("productRequired") }),
    userId: z.string().min(1, { message: t("userRequired") }),
    rating: z.coerce.number().int().min(1, { message: t("ratingMin") }).max(5, { message: t("ratingMax") }),
  });
}

export function createInsertCategorySchema(t: T) {
  return z.object({
    name: z.string().min(2, { message: t("nameMin") }),
    nameEn: z.string().optional().nullable(),
    slug: z.string().min(2, { message: t("slugMin") }),
    description: z.string().optional().nullable(),
    descriptionEn: z.string().optional().nullable(),
    image: z.string().optional().nullable(),
    parentId: z.string().uuid().optional().nullable(),
    sortOrder: z.coerce.number().int().default(0),
    isActive: z.boolean().default(true),
  });
}

export function createUpdateCategorySchema(t: T) {
  return createInsertCategorySchema(t).extend({
    id: z.string().min(1, { message: t("idRequired") }),
  });
}

export function createInsertAddressSchema(t: T) {
  return z.object({
    label: z.string().optional().nullable(),
    fullName: z.string().min(3, { message: t("fullNameMin") }),
    phone: z.string().optional().nullable(),
    address: z.string().min(3, { message: t("addressMin") }),
    address2: z.string().optional().nullable(),
    city: z.string().min(3, { message: t("cityMin") }),
    state: z.string().optional().nullable(),
    postalCode: z.string().min(3, { message: t("postalCodeMin") }),
    country: z.string().min(3, { message: t("countryMin") }),
    lat: z.number().optional().nullable(),
    lng: z.number().optional().nullable(),
    isDefault: z.boolean().default(false),
  });
}

export function createUpdateAddressSchema(t: T) {
  return createInsertAddressSchema(t).extend({
    id: z.string().min(1, { message: t("idRequired") }),
  });
}

export function createInsertCouponSchema(t: T) {
  const cur = createCurrency(t);
  return z.object({
    code: z.string().min(3, { message: t("couponCodeMin") }).toUpperCase(),
    description: z.string().optional().nullable(),
    discountType: z.enum(["percentage", "fixed_amount", "free_shipping"]),
    discountValue: cur,
    minOrderAmount: cur.optional().nullable(),
    maxDiscount: cur.optional().nullable(),
    maxUses: z.coerce.number().int().positive().optional().nullable(),
    maxUsesPerUser: z.coerce.number().int().positive().default(1),
    validFrom: z.coerce.date(),
    validUntil: z.coerce.date().optional().nullable(),
    isActive: z.boolean().default(true),
    appliesToAll: z.boolean().default(true),
    categoryIds: z.array(z.string().uuid()).optional().default([]),
    productIds: z.array(z.string().uuid()).optional().default([]),
  });
}

export function createUpdateCouponSchema(t: T) {
  return createInsertCouponSchema(t).extend({
    id: z.string().min(1, { message: t("idRequired") }),
  });
}
