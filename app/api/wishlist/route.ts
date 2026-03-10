import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ productIds: [] });
  }

  const wishlist = await prisma.wishlist.findUnique({
    where: { userId: session.user.id },
    include: { items: { select: { productId: true } } },
  });

  const productIds = wishlist?.items.map((item) => item.productId) ?? [];
  return NextResponse.json({ productIds });
}
