// One-off: a single product (syndesmoi-frenon-volvo-sf070018) had its admin
// upload pointing at /api/uploads/<uuid>.png, but the file is missing from
// the production volume — so the product page returns 404 for the image.
// Replace it with the freshly-seeded avl.gr image instead.

import { PrismaClient } from "@prisma/client";

const TARGET_SLUG = "syndesmoi-frenon-volvo-sf070018";
const NEW_IMAGES = ["/images/products/070018/01.png"];

async function main() {
  const prisma = new PrismaClient();
  const before = await prisma.product.findUnique({
    where: { slug: TARGET_SLUG },
    select: { id: true, slug: true, images: true },
  });
  if (!before) throw new Error(`product ${TARGET_SLUG} not found`);
  console.log("BEFORE:", before.images);
  const updated = await prisma.product.update({
    where: { id: before.id },
    data: { images: NEW_IMAGES },
    select: { images: true },
  });
  console.log("AFTER: ", updated.images);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
