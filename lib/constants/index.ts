export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "AVL";
export const APP_DESCRIPTION =
  process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
  "Modern e-commerce store built with Next.js and Tailwind CSS";
// SERVER_URL must be set in production via NEXT_PUBLIC_SERVER_URL.
// Localhost fallback is only for local dev — never assume it in prod code paths.
export const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  (process.env.NODE_ENV === "production"
    ? ""
    : "http://localhost:3000");
export const LATEST_PRODUCTS_LIMIT =
  Number(process.env.LATEST_PRODUCTS_LIMIT) || 4;

export const signInDefaultValues = {
  email: "",
  password: "",
};

export const signUpDefaultValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export const shippingAddressDefaultValues= {
  fullName: "",
  address: "",
  city: "",
  postalCode: "",
  country: "",
  phone: "",
  shippingMethod: "home" as "home" | "boxnow_locker",
  boxnowLocker: null,
  lat: 0,
  lng: 0,
};

export const PAYMENT_METHODS = process.env.PAYMENT_METHODS
  ? process.env.PAYMENT_METHODS.split(", ")
  : ["Viva", "CashOnDelivery"];

export const DEFAULT_PAYMENT_METHOD =
  process.env.DEFAULT_PAYMENT_METHOD || "Viva";

export const PAGE_SIZE = Number(process.env.PAGE_SIZE) || 12;

export const productDefaultValues = {
  name: "",
  nameEn: "",
  slug: "",
  category: "",
  categoryId: null,
  images: [],
  brand: "",
  description: "",
  descriptionEn: "",
  price: '0',
  stock: 0,
  lowStockThreshold: 20,
  allowBackorder: false,
  isFeatured: false,
  banner: null,
}

export const USER_ROLES = process.env.USER_ROLES ? process.env.USER_ROLES.split(", ") : ["user", "admin"];

export const reviewFormDefaultValues = {
  title: "",
  description: "",
  rating: 0,
};
