/**
 * Backfill English translations for Categories and Products.
 *
 * Reads:
 *   - lib/data/category-translations-en.ts  (slug → en name/description)
 *   - lib/data/product-translations-en.ts   (slug → en name/description)
 *
 * Writes to:
 *   - Category.nameEn / Category.descriptionEn
 *   - Product.nameEn  / Product.descriptionEn
 *
 * Idempotent: re-running is safe. We only overwrite when the source file
 * differs from what's currently in the DB, so manual edits via the admin UI
 * survive subsequent backfill runs.
 *
 * Usage:
 *   npx tsx scripts/backfill-en-translations.ts          # local
 *   docker run --rm --network kapda_default \
 *     -v /opt/eshop:/work -w /work \
 *     --env-file /opt/eshop/.env.production node:20-alpine \
 *     sh -c "npx -y tsx@4 scripts/backfill-en-translations.ts"
 */
import { PrismaClient } from "@prisma/client";
import { categoryTranslationsEn } from "../lib/data/category-translations-en";
import { productTranslationsEn } from "../lib/data/product-translations-en";

const prisma = new PrismaClient();

async function main() {
  let catUpdated = 0;
  let catSkipped = 0;
  let catMissingTranslation = 0;

  const categories = await prisma.category.findMany({
    select: { id: true, slug: true, name: true, nameEn: true, descriptionEn: true },
  });

  for (const c of categories) {
    const t = categoryTranslationsEn[c.slug];
    if (!t) {
      catMissingTranslation++;
      continue;
    }
    const desiredName = t.name;
    const desiredDesc = t.description ?? null;
    if (c.nameEn === desiredName && c.descriptionEn === desiredDesc) {
      catSkipped++;
      continue;
    }
    await prisma.category.update({
      where: { id: c.id },
      data: {
        nameEn: desiredName,
        descriptionEn: desiredDesc,
      },
    });
    catUpdated++;
  }

  let prodUpdated = 0;
  let prodSkipped = 0;
  let prodMissingTranslation = 0;

  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    select: { id: true, slug: true, name: true, nameEn: true, descriptionEn: true },
  });

  for (const p of products) {
    const t = productTranslationsEn[p.slug];
    if (!t) {
      prodMissingTranslation++;
      continue;
    }
    if (p.nameEn === t.name && p.descriptionEn === t.description) {
      prodSkipped++;
      continue;
    }
    await prisma.product.update({
      where: { id: p.id },
      data: {
        nameEn: t.name,
        descriptionEn: t.description,
      },
    });
    prodUpdated++;
  }

  console.log("─── Backfill report ──────────────────────────────");
  console.log(
    `Categories: ${catUpdated} updated, ${catSkipped} already current, ${catMissingTranslation} without translation (slug not in mapping file)`,
  );
  console.log(
    `Products:   ${prodUpdated} updated, ${prodSkipped} already current, ${prodMissingTranslation} without translation`,
  );
  console.log("──────────────────────────────────────────────────");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
