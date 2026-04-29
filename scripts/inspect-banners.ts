import { PrismaClient } from "@prisma/client";

async function main() {
  const p = new PrismaClient();
  const rows = await p.product.findMany({
    where: { isFeatured: true },
    select: { slug: true, banner: true, name: true, images: true },
  });
  console.log("FEATURED products in DB:");
  for (const r of rows) {
    console.log(`\n  ${r.slug}`);
    console.log(`    name:   ${r.name}`);
    console.log(`    banner: ${r.banner}`);
    console.log(`    images: ${JSON.stringify(r.images)}`);
  }

  // Also any product with non-null banner
  const allWithBanner = await p.product.findMany({
    where: { banner: { not: null } },
    select: { slug: true, banner: true, isFeatured: true },
  });
  console.log(`\n\nALL products with banner field set (${allWithBanner.length}):`);
  for (const r of allWithBanner) {
    console.log(`  ${r.isFeatured ? "★" : " "} ${r.slug} → ${r.banner}`);
  }
  await p.$disconnect();
}
main();
