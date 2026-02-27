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
  status?: string; // comma-separated or "all"
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
  couponStats: {
    totalDiscountGiven: number;
    ordersWithCoupons: number;
    topCoupons: { code: string; usageCount: number; totalDiscount: number }[];
  };
  lowStockProducts: {
    id: string;
    name: string;
    slug: string;
    stock: number;
    lowStockThreshold: number;
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

// ── Main function ──

export async function getDashboardData(
  filters: DashboardFilters
): Promise<DashboardData> {
  const range = resolveDateRange(filters);
  const prevRange = range ? previousDateRange(range) : null;

  // Build Prisma where filters for orders
  const statusList =
    filters.status && filters.status !== "all"
      ? filters.status.split(",")
      : undefined;
  const paymentMethod =
    filters.paymentMethod && filters.paymentMethod !== "all"
      ? filters.paymentMethod
      : undefined;
  const category =
    filters.category && filters.category !== "all"
      ? filters.category
      : undefined;

  const dateFilter = range
    ? { gte: range.from, lte: range.to }
    : undefined;
  const prevDateFilter = prevRange
    ? { gte: prevRange.from, lte: prevRange.to }
    : undefined;

  const orderWhere: Prisma.OrderWhereInput = {
    ...(dateFilter && { createdAt: dateFilter }),
    ...(statusList && { status: { in: statusList } }),
    ...(paymentMethod && { paymentMethod }),
  };

  const prevOrderWhere: Prisma.OrderWhereInput = {
    ...(prevDateFilter && { createdAt: prevDateFilter }),
    ...(statusList && { status: { in: statusList } }),
    ...(paymentMethod && { paymentMethod }),
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
    couponDiscountAgg,
    couponOrderCount,
    topCouponsRaw,
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
    // 5. Total products
    prisma.product.count(),
    // 6. Sales time series
    getSalesTimeSeries(range, statusList, paymentMethod, category),
    // 7. Orders by status
    getOrdersByStatus(range),
    // 8. Revenue by payment method
    getRevenueByPaymentMethod(range, statusList),
    // 9. Top products
    getTopProducts(range, statusList, paymentMethod, category, 10),
    // 10. Sales by category
    getSalesByCategory(range, statusList, paymentMethod),
    // 11. Coupon discount aggregate (use raw to avoid Prisma $extends type issues)
    getCouponDiscountAgg(range, statusList, paymentMethod),
    // 12. Coupon order count
    getCouponOrderCount(range, statusList, paymentMethod),
    // 13. Top coupons
    getTopCoupons(range),
    // 14. Low stock products
    getLowStockProducts(),
    // 15. Latest orders
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
      take: 8,
    }),
    // 16. Categories for filter dropdown
    prisma.product.findMany({
      distinct: ["category"],
      select: { category: true },
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
    couponStats: {
      totalDiscountGiven: couponDiscountAgg.totalDiscount,
      ordersWithCoupons: couponOrderCount,
      topCoupons: topCouponsRaw,
    },
    lowStockProducts,
    latestOrders: latestOrders.map((o) => {
      // Prisma $extends result transformers can omit some fields from type
      const order = o as typeof o & { status: string };
      return {
        id: order.id,
        userName: order.user?.name ?? "Deleted User",
        createdAt: order.createdAt,
        totalPrice: order.totalPrice,
        status: order.status,
        paymentMethod: order.paymentMethod,
      };
    }),
    productsCount,
    categories: categoriesRaw.map((c) => c.category),
  };
}

// ── Helper query functions ──

async function getSalesTimeSeries(
  range: DateRange | null,
  statusList?: string[],
  paymentMethod?: string,
  category?: string
): Promise<{ date: string; revenue: number; orders: number }[]> {
  const useDays = range ? rangeSpanDays(range) < 90 : false;
  const format = useDays ? "YYYY-MM-DD" : "YYYY-MM";

  // Build dynamic WHERE clauses
  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIdx = 1;

  if (range) {
    conditions.push(`o."createdAt" >= $${paramIdx}`);
    params.push(range.from);
    paramIdx++;
    conditions.push(`o."createdAt" <= $${paramIdx}`);
    params.push(range.to);
    paramIdx++;
  }
  if (statusList && statusList.length > 0) {
    conditions.push(
      `o."status" IN (${statusList.map(() => `$${paramIdx++}`).join(",")})`
    );
    params.push(...statusList);
  }
  if (paymentMethod) {
    conditions.push(`o."paymentMethod" = $${paramIdx}`);
    params.push(paymentMethod);
    paramIdx++;
  }

  let joinClause = "";
  if (category) {
    joinClause = `
      JOIN "OrderItem" oi2 ON oi2."orderId" = o."id"
      JOIN "Product" p2 ON oi2."productId" = p2."id"
    `;
    conditions.push(`p2."category" = $${paramIdx}`);
    params.push(category);
    paramIdx++;
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // Using Prisma.$queryRawUnsafe for dynamic queries
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
    Array<{ status: string; count: bigint }>
  >(
    `SELECT "status", COUNT(*)::int as "count" FROM "Order" ${whereClause} GROUP BY "status" ORDER BY "count" DESC`,
    ...params
  );

  return raw.map((r) => ({ status: r.status, count: Number(r.count) }));
}

async function getRevenueByPaymentMethod(
  range: DateRange | null,
  statusList?: string[]
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
  if (statusList && statusList.length > 0) {
    conditions.push(
      `"status" IN (${statusList.map(() => `$${paramIdx++}`).join(",")})`
    );
    params.push(...statusList);
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
  statusList?: string[],
  paymentMethod?: string,
  category?: string,
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
  if (statusList && statusList.length > 0) {
    conditions.push(
      `o."status" IN (${statusList.map(() => `$${paramIdx++}`).join(",")})`
    );
    params.push(...statusList);
  }
  if (paymentMethod) {
    conditions.push(`o."paymentMethod" = $${paramIdx++}`);
    params.push(paymentMethod);
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
  statusList?: string[],
  paymentMethod?: string
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
  if (statusList && statusList.length > 0) {
    conditions.push(
      `o."status" IN (${statusList.map(() => `$${paramIdx++}`).join(",")})`
    );
    params.push(...statusList);
  }
  if (paymentMethod) {
    conditions.push(`o."paymentMethod" = $${paramIdx++}`);
    params.push(paymentMethod);
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

async function getTopCoupons(
  range: DateRange | null
): Promise<{ code: string; usageCount: number; totalDiscount: number }[]> {
  const conditions: string[] = [`"couponCode" IS NOT NULL`];
  const params: unknown[] = [];
  let paramIdx = 1;

  if (range) {
    conditions.push(`"createdAt" >= $${paramIdx++}`);
    params.push(range.from);
    conditions.push(`"createdAt" <= $${paramIdx++}`);
    params.push(range.to);
  }

  const whereClause = `WHERE ${conditions.join(" AND ")}`;

  const raw = await prisma.$queryRawUnsafe<
    Array<{ code: string; usageCount: bigint; totalDiscount: number }>
  >(
    `SELECT "couponCode" as "code",
            COUNT(*)::int as "usageCount",
            SUM("discountAmount")::float as "totalDiscount"
     FROM "Order"
     ${whereClause}
     GROUP BY "couponCode"
     ORDER BY "usageCount" DESC
     LIMIT 5`,
    ...params
  );

  return raw.map((r) => ({
    code: r.code,
    usageCount: Number(r.usageCount),
    totalDiscount: Number(r.totalDiscount),
  }));
}

async function getCouponDiscountAgg(
  range: DateRange | null,
  statusList?: string[],
  paymentMethod?: string
): Promise<{ totalDiscount: number }> {
  const conditions: string[] = [`"discountAmount" > 0`];
  const params: unknown[] = [];
  let paramIdx = 1;

  if (range) {
    conditions.push(`"createdAt" >= $${paramIdx++}`);
    params.push(range.from);
    conditions.push(`"createdAt" <= $${paramIdx++}`);
    params.push(range.to);
  }
  if (statusList && statusList.length > 0) {
    conditions.push(
      `"status" IN (${statusList.map(() => `$${paramIdx++}`).join(",")})`
    );
    params.push(...statusList);
  }
  if (paymentMethod) {
    conditions.push(`"paymentMethod" = $${paramIdx++}`);
    params.push(paymentMethod);
  }

  const whereClause = `WHERE ${conditions.join(" AND ")}`;

  const raw = await prisma.$queryRawUnsafe<
    Array<{ totalDiscount: number }>
  >(
    `SELECT COALESCE(SUM("discountAmount"), 0)::float as "totalDiscount" FROM "Order" ${whereClause}`,
    ...params
  );

  return { totalDiscount: Number(raw[0]?.totalDiscount ?? 0) };
}

async function getCouponOrderCount(
  range: DateRange | null,
  statusList?: string[],
  paymentMethod?: string
): Promise<number> {
  const conditions: string[] = [`"couponCode" IS NOT NULL`];
  const params: unknown[] = [];
  let paramIdx = 1;

  if (range) {
    conditions.push(`"createdAt" >= $${paramIdx++}`);
    params.push(range.from);
    conditions.push(`"createdAt" <= $${paramIdx++}`);
    params.push(range.to);
  }
  if (statusList && statusList.length > 0) {
    conditions.push(
      `"status" IN (${statusList.map(() => `$${paramIdx++}`).join(",")})`
    );
    params.push(...statusList);
  }
  if (paymentMethod) {
    conditions.push(`"paymentMethod" = $${paramIdx++}`);
    params.push(paymentMethod);
  }

  const whereClause = `WHERE ${conditions.join(" AND ")}`;

  const raw = await prisma.$queryRawUnsafe<Array<{ count: number }>>(
    `SELECT COUNT(*)::int as "count" FROM "Order" ${whereClause}`,
    ...params
  );

  return Number(raw[0]?.count ?? 0);
}

async function getLowStockProducts(): Promise<
  {
    id: string;
    name: string;
    slug: string;
    stock: number;
    lowStockThreshold: number;
    price: string;
  }[]
> {
  const raw = await prisma.$queryRawUnsafe<
    Array<{
      id: string;
      name: string;
      slug: string;
      stock: number;
      lowStockThreshold: number;
      price: Prisma.Decimal;
    }>
  >(
    `SELECT "id", "name", "slug", "stock", "lowStockThreshold", "price"
     FROM "Product"
     WHERE "stock" <= "lowStockThreshold"
     ORDER BY "stock" ASC
     LIMIT 10`
  );

  return raw.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    stock: Number(r.stock),
    lowStockThreshold: Number(r.lowStockThreshold),
    price: r.price.toString(),
  }));
}
