import { z } from "zod";
import { formatNumberWithDecimal } from "./utils";

const currency = z.string().refine((value) => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(Number(value))),"Price must have exact two decimal places");

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