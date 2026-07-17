"use server";

import { prisma } from "@/db/prisma";
import { unstable_cache } from "next/cache";

export const getAllBrands = unstable_cache(
  async () => {
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
  },
  ["getAllBrands"],
  { revalidate: 300, tags: ["products"] }
);
