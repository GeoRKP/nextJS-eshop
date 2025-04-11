import {
  cartItemSchema,
  insertCartSchema,
  shippingAddressSchema,
  insertOrderSchema,
  insertOrderItemSchema,
  insertProductSchema,
} from "@/lib/validators";
import { z } from "zod";

export type Product = z.infer<typeof insertProductSchema> & {
  rating: string;
};

export type Cart = z.infer<typeof insertCartSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;
export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
export type Order = z.infer<typeof insertOrderSchema> & {
  id: string;
  createdAt: Date;
  isPaid: boolean;
  paidAt: Date | null;
  isDelivered: boolean;
  deliveredAt: Date | null;
  orderitems: OrderItem[];
  user: {
    name: string;
    email: string;
  };
};
export type OrderItem = z.infer<typeof insertOrderItemSchema>;
