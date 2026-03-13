"use server";

import { prisma } from "@/db/prisma";
import { Prisma } from "@prisma/client";
import {
  resolveDateRange,
  previousDateRange,
  rangeSpanDays,
  type DateRange,
} from "@/lib/dashboard-utils";

// ── Types ──

export type DashboardFilters = {
  period?: string;
  from?: string;
  to?: string;
  paidStatus?: string; // "all" | "paid" | "unpaid"
  paymentMethod?: string; // "Stripe" | "Paypal" | "CashOnDelivery" | "all"
  category?: string; // category name or "all"
};

export type DashboardData = {
  kpi: {
    revenue: number;
    revenuePrev: number;
    ordersCount: number;
    ordersCountPrev: number;
    newCustomers: number;
    newCustomersPrev: number;
    avgOrderValue: number;
    avgOrderValuePrev: number;
  };
  salesTimeSeries: { date: string; revenue: number; orders: number }[];
  ordersByStatus: { status: string; count: number }[];
  revenueByPaymentMethod: { method: string; revenue: number }[];
  topProducts: { name: string; unitsSold: number; revenue: number }[];
  salesByCategory: { category: string; revenue: number }[];
  lowStockProducts: {
    id: string;
    name: string;
    slug: string;
    stock: number;
    price: string;
  }[];
  latestOrders: {
    id: string;
    userName: string;
    createdAt: Date;
    totalPrice: string;
    status: string;
    paymentMethod: string;
  }[];
  productsCount: number;
  categories: string[];
};

// ── Derive order status from isPaid/isDelivered ──

function deriveOrderStatus(isPaid: boolean, isDelivered: boolean): string {
  if (isDelivered) return "Delivered";
  if (isPaid) return "Paid";
  return "Pending";
}

// ── Main function ──

export async function getDashboardData(
  filters: DashboardFilters
): Promise<DashboardData> {
  const range = resolveDateRange(filters);
  const prevRange = range ? previousDateRange(range) : null;

  const paymentMethod =
    filters.paymentMethod && filters.paymentMethod !== "all"
      ? filters.paymentMethod
      : undefined;
  const category =
    filters.category && filters.category !== "all"
      ? filters.category
      : undefined;
  const paidStatus =
    filters.paidStatus && filters.paidStatus !== "all"
      ? filters.paidStatus
      : undefined;

  const dateFilter = range
    ? { gte: range.from, lte: range.to }
    : undefined;
  const prevDateFilter = prevRange
    ? { gte: prevRange.from, lte: prevRange.to }
    : undefined;

  const paidFilter: Prisma.OrderWhereInput =
    paidStatus === "paid"
      ? { isPaid: true }
      : paidStatus === "unpaid"
        ? { isPaid: false }
        : {};

  const orderWhere: Prisma.OrderWhereInput = {
    ...(dateFilter && { createdAt: dateFilter }),
    ...(paymentMethod && { paymentMethod }),
    ...paidFilter,
  };

  const prevOrderWhere: Prisma.OrderWhereInput = {
    ...(prevDateFilter && { createdAt: prevDateFilter }),
    ...(paymentMethod && { paymentMethod }),
    ...paidFilter,
  };

  const [
    currentAgg,
    prevAgg,
    currentCustomers,
    prevCustomers,
    productsCount,
    salesTimeSeries,
    ordersByStatus,
    revenueByPaymentMethod,
    topProducts,
    salesByCategory,
    lowStockProducts,
    latestOrders,
    categoriesRaw,
  ] = await Promise.all([
    // 1. Current period revenue + count
    prisma.order.aggregate({
      where: { ...orderWhere, isPaid: true },
      _sum: { totalPrice: true },
      _count: true,
    }),
    // 2. Previous period revenue + count
    prisma.order.aggregate({
      where: { ...prevOrderWhere, isPaid: true },
      _sum: { totalPrice: true },
      _count: true,
    }),
    // 3. New customers in current period
    prisma.user.count({
      where: dateFilter ? { createdAt: dateFilter } : undefined,
    }),
    // 4. New customers in previous period
    prisma.user.count({
      where: prevDateFilter ? { createdAt: prevDateFilter } : undefined,
    }),
    // 5. Total products (exclude soft-deleted)
    prisma.product.count({ where: { deletedAt: null } }),
    // 6. Sales time series
    getSalesTimeSeries(range, paymentMethod, category, paidStatus),
    // 7. Orders by status (derived from isPaid/isDelivered)
    getOrdersByStatus(range),
    // 8. Revenue by payment method
    getRevenueByPaymentMethod(range, paidStatus),
    // 9. Top products
    getTopProducts(range, paymentMethod, category, paidStatus, 10),
    // 10. Sales by category
    getSalesByCategory(range, paymentMethod, paidStatus),
    // 11. Low stock products (stock <= per-product threshold)
    getLowStockProducts(),
    // 12. Latest orders
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
      take: 8,
    }),
    // 13. Categories for filter dropdown (exclude soft-deleted)
    prisma.product.groupBy({
      by: ["category"],
      where: { deletedAt: null },
      orderBy: { category: "asc" },
    }),
  ]);

  const revenue = Number(currentAgg._sum.totalPrice ?? 0);
  const revenuePrev = Number(prevAgg._sum.totalPrice ?? 0);
  const ordersCount = currentAgg._count;
  const ordersCountPrev = prevAgg._count;

  return {
    kpi: {
      revenue,
      revenuePrev,
      ordersCount,
      ordersCountPrev,
      newCustomers: currentCustomers,
      newCustomersPrev: prevCustomers,
      avgOrderValue: ordersCount > 0 ? revenue / ordersCount : 0,
      avgOrderValuePrev:
        ordersCountPrev > 0 ? revenuePrev / ordersCountPrev : 0,
    },
    salesTimeSeries,
    ordersByStatus,
    revenueByPaymentMethod,
    topProducts,
    salesByCategory,
    lowStockProducts,
    latestOrders: latestOrders.map((o) => ({
      id: o.id,
      userName: o.user?.name ?? "Deleted User",
      createdAt: o.createdAt,
      totalPrice: o.totalPrice,
      status: deriveOrderStatus(o.isPaid, o.isDelivered),
      paymentMethod: o.paymentMethod,
    })),
    productsCount,
    categories: categoriesRaw.map((c: { category: string }) => c.category),
  };
}

// ── Helper query functions ──

async function getSalesTimeSeries(
  range: DateRange | null,
  paymentMethod?: string,
  category?: string,
  paidStatus?: string
): Promise<{ date: string; revenue: number; orders: number }[]> {
  const useDays = range ? rangeSpanDays(range) < 90 : false;
  const format = useDays ? "YYYY-MM-DD" : "YYYY-MM";

  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIdx = 1;

  if (range) {
    conditions.push(`o."createdAt" >= $${paramIdx++}`);
    params.push(range.from);
    conditions.push(`o."createdAt" <= $${paramIdx++}`);
    params.push(range.to);
  }
  if (paymentMethod) {
    conditions.push(`o."paymentMethod" = $${paramIdx++}`);
    params.push(paymentMethod);
  }
  if (paidStatus === "paid") {
    conditions.push(`o."isPaid" = true`);
  } else if (paidStatus === "unpaid") {
    conditions.push(`o."isPaid" = false`);
  }

  let joinClause = "";
  if (category) {
    joinClause = `
      JOIN "OrderItem" oi2 ON oi2."orderId" = o."id"
      JOIN "Product" p2 ON oi2."productId" = p2."id"
    `;
    conditions.push(`p2."category" = $${paramIdx++}`);
    params.push(category);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const sql = `
    SELECT to_char(o."createdAt", '${format}') as "date",
           SUM(o."totalPrice")::float as "revenue",
           COUNT(DISTINCT o."id")::int as "orders"
    FROM "Order" o
    ${joinClause}
    ${whereClause}
    GROUP BY to_char(o."createdAt", '${format}')
    ORDER BY "date" ASC
  `;

  const raw = await prisma.$queryRawUnsafe<
    Array<{ date: string; revenue: number; orders: number }>
  >(sql, ...params);

  return raw.map((r) => ({
    date: r.date,
    revenue: Number(r.revenue),
    orders: Number(r.orders),
  }));
}

async function getOrdersByStatus(
  range: DateRange | null
): Promise<{ status: string; count: number }[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIdx = 1;

  if (range) {
    conditions.push(`"createdAt" >= $${paramIdx++}`);
    params.push(range.from);
    conditions.push(`"createdAt" <= $${paramIdx++}`);
    params.push(range.to);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const raw = await prisma.$queryRawUnsafe<
    Array<{ status: string; count: number }>
  >(
    `SELECT
       CASE
         WHEN "isDelivered" = true THEN 'Delivered'
         WHEN "isPaid" = true THEN 'Paid'
         ELSE 'Pending'
       END as "status",
       COUNT(*)::int as "count"
     FROM "Order"
     ${whereClause}
     GROUP BY 1
     ORDER BY "count" DESC`,
    ...params
  );

  return raw.map((r) => ({ status: r.status, count: Number(r.count) }));
}

async function getRevenueByPaymentMethod(
  range: DateRange | null,
  paidStatus?: string
): Promise<{ method: string; revenue: number }[]> {
  const conditions: string[] = [`"isPaid" = true`];
  const params: unknown[] = [];
  let paramIdx = 1;

  if (range) {
    conditions.push(`"createdAt" >= $${paramIdx++}`);
    params.push(range.from);
    conditions.push(`"createdAt" <= $${paramIdx++}`);
    params.push(range.to);
  }
  if (paidStatus === "unpaid") {
    // No revenue for unpaid orders
    return [];
  }

  const whereClause = `WHERE ${conditions.join(" AND ")}`;

  const raw = await prisma.$queryRawUnsafe<
    Array<{ method: string; revenue: number }>
  >(
    `SELECT "paymentMethod" as "method", SUM("totalPrice")::float as "revenue" FROM "Order" ${whereClause} GROUP BY "paymentMethod" ORDER BY "revenue" DESC`,
    ...params
  );

  return raw.map((r) => ({ method: r.method, revenue: Number(r.revenue) }));
}

async function getTopProducts(
  range: DateRange | null,
  paymentMethod?: string,
  category?: string,
  paidStatus?: string,
  limit: number = 10
): Promise<{ name: string; unitsSold: number; revenue: number }[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIdx = 1;

  if (range) {
    conditions.push(`o."createdAt" >= $${paramIdx++}`);
    params.push(range.from);
    conditions.push(`o."createdAt" <= $${paramIdx++}`);
    params.push(range.to);
  }
  if (paymentMethod) {
    conditions.push(`o."paymentMethod" = $${paramIdx++}`);
    params.push(paymentMethod);
  }
  if (paidStatus === "paid") {
    conditions.push(`o."isPaid" = true`);
  } else if (paidStatus === "unpaid") {
    conditions.push(`o."isPaid" = false`);
  }

  let joinProduct = "";
  if (category) {
    joinProduct = `JOIN "Product" p ON oi."productId" = p."id"`;
    conditions.push(`p."category" = $${paramIdx++}`);
    params.push(category);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  params.push(limit);
  const limitParam = `$${paramIdx}`;

  const raw = await prisma.$queryRawUnsafe<
    Array<{ name: string; unitsSold: number; revenue: number }>
  >(
    `SELECT oi."name",
            SUM(oi."qty")::int as "unitsSold",
            SUM(oi."qty" * oi."price")::float as "revenue"
     FROM "OrderItem" oi
     JOIN "Order" o ON oi."orderId" = o."id"
     ${joinProduct}
     ${whereClause}
     GROUP BY oi."name"
     ORDER BY "revenue" DESC
     LIMIT ${limitParam}`,
    ...params
  );

  return raw.map((r) => ({
    name: r.name,
    unitsSold: Number(r.unitsSold),
    revenue: Number(r.revenue),
  }));
}

async function getSalesByCategory(
  range: DateRange | null,
  paymentMethod?: string,
  paidStatus?: string
): Promise<{ category: string; revenue: number }[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIdx = 1;

  if (range) {
    conditions.push(`o."createdAt" >= $${paramIdx++}`);
    params.push(range.from);
    conditions.push(`o."createdAt" <= $${paramIdx++}`);
    params.push(range.to);
  }
  if (paymentMethod) {
    conditions.push(`o."paymentMethod" = $${paramIdx++}`);
    params.push(paymentMethod);
  }
  if (paidStatus === "paid") {
    conditions.push(`o."isPaid" = true`);
  } else if (paidStatus === "unpaid") {
    conditions.push(`o."isPaid" = false`);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const raw = await prisma.$queryRawUnsafe<
    Array<{ category: string; revenue: number }>
  >(
    `SELECT p."category",
            SUM(oi."qty" * oi."price")::float as "revenue"
     FROM "OrderItem" oi
     JOIN "Product" p ON oi."productId" = p."id"
     JOIN "Order" o ON oi."orderId" = o."id"
     ${whereClause}
     GROUP BY p."category"
     ORDER BY "revenue" DESC`,
    ...params
  );

  return raw.map((r) => ({
    category: r.category,
    revenue: Number(r.revenue),
  }));
}

async function getLowStockProducts(): Promise<
  {
    id: string;
    name: string;
    slug: string;
    stock: number;
    price: string;
  }[]
> {
  const raw = await prisma.$queryRaw<
    Array<{
      id: string;
      name: string;
      slug: string;
      stock: number;
      price: number | string;
      lowStockThreshold: number;
    }>
  >`
    SELECT id, name, slug, stock, price, "lowStockThreshold"
    FROM "Product"
    WHERE stock <= "lowStockThreshold" AND "deletedAt" IS NULL
    ORDER BY stock ASC
    LIMIT 10
  `;

  return raw.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    stock: p.stock,
    price: p.price.toString(),
  }));
}
