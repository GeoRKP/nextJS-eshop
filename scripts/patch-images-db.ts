// Selective DB patch: update Product.images only, for products whose slug
// matches the patched sample-data.ts entries. NEVER touches users/orders/reviews.
//
// Idempotent: re-running with same data is a no-op.
//
// Run with:
//   npx tsx scripts/patch-images-db.ts            # dry-run
//   npx tsx scripts/patch-images-db.ts --apply    # actually write

import { PrismaClient } from "@prisma/client";
import sampleData from "../db/sample-data";

const APPLY = process.argv.includes("--apply");

async function main() {
  const prisma = new PrismaClient();

  const candidates = sampleData.products
    .filter((p) =>
      p.images.some((img: string) => img.startsWith("/images/products/"))
    )
    .map((p) => ({ slug: p.slug, name: p.name, images: p.images }));

  console.log(
    `[patch-images-db] ${APPLY ? "APPLY" : "DRY-RUN"} mode. ${candidates.length} candidate products.`
  );

  let updated = 0;
  let skipped = 0;
  let notFound = 0;

  for (const c of candidates) {
    const existing = await prisma.product.findUnique({
      where: { slug: c.slug },
      select: { id: true, slug: true, images: true, deletedAt: true },
    });

    if (!existing) {
      notFound++;
      console.log(`  [NOT FOUND] ${c.slug}`);
      continue;
    }

    // Preserve admin uploads — don't overwrite anything that was uploaded
    // through the admin UI. Only patch products still on the placeholder.
    const isPlaceholderOnly =
      existing.images.length === 1 &&
      existing.images[0] === "/images/placeholder.svg";

    if (!isPlaceholderOnly) {
      skipped++;
      console.log(
        `  [SKIP – admin uploaded] ${c.slug}  (current: ${JSON.stringify(existing.images)})`
      );
      continue;
    }

    const same =
      existing.images.length === c.images.length &&
      existing.images.every((v, i) => v === c.images[i]);

    if (same) {
      skipped++;
      continue;
    }

    if (APPLY) {
      await prisma.product.update({
        where: { id: existing.id },
        data: { images: c.images },
      });
    }
    updated++;
    console.log(
      `  [${APPLY ? "UPDATE" : "WOULD UPDATE"}] ${c.slug}\n      ${JSON.stringify(existing.images)} -> ${JSON.stringify(c.images)}`
    );
  }

  console.log(`\n[patch-images-db] DONE`);
  console.log(`  Updated:    ${updated}`);
  console.log(`  Skipped (already correct): ${skipped}`);
  console.log(`  Not found:  ${notFound}`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
