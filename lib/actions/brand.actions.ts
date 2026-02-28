"use server";

import { prisma } from "@/db/prisma";

export async function getAllBrands() {
  const data = await prisma.product.groupBy({
    by: ["brand"],
    _count: { brand: true },
    orderBy: { _count: { brand: "desc" } },
    where: { deletedAt: null },
  });

  return data.map((item) => ({
    brand: item.brand,
    _count: item._count.brand,
  }));
}
