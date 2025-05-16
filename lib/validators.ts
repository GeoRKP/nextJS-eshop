import { z } from "zod";
import { formatNumberWithDecimal } from "./utils";
import { PAYMENT_METHODS } from "./constants";

const currency = z
  .string()
  .refine(
    (value) => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(Number(value))),
    "Price must have exact two decimal places"
  );

//Schema for creating a product

export const insertProductSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters long" }),
  slug: z
    .string()
    .min(3, { message: "Slug must be at least 3 characters long" }),
  category: z
    .string()
    .min(3, { message: "Category must be at least 3 characters long" }),
  brand: z
    .string()
    .min(3, { message: "Brand must be at least 3 characters long" }),
  description: z
    .string()
    .min(3, { message: "Description must be at least 3 characters long" }),
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
    .nonnegative({ message: "Quantity must be a positive number" }),
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
});

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

// Svhema for updating the user profile

export const updateUserProfileSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters long" }),
  email: z.string().email({ message: "Invalid email address" }),
});

// Update User Schema

export const updateUserSchema = updateUserProfileSchema.extend({
  id: z.string().min(1, { message: "Id is required" }),
  role: z.string().min(1, { message: "Role is required" }),
});

// Schema for inserting a review

export const insertReviewSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters long" }),
  description: z.string().min(3, { message: "Description must be at least 3 characters long" }),
  productId: z.string().min(1, { message: "Product is required" }),
  userId: z.string().min(1, { message: "User is required" }),
  rating: z.coerce.number().int().min(1, { message: "Rating must be at least 1" }).max(5, { message: "Rating must be at most 5" }),
});
