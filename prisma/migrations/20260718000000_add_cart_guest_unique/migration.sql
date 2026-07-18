-- Guard against two guest carts sharing a sessionCartId (a race in
-- addItemToCart's findFirst + create). Prisma schema can't express partial
-- unique indexes, so this is applied as raw SQL (this DB is migrated via psql,
-- not `prisma db push`, because Product.search_vector is GENERATED ALWAYS).

-- 1) Dedup existing guest carts: keep the most recent per sessionCartId.
DELETE FROM "Cart" c
USING "Cart" c2
WHERE c."userId" IS NULL
  AND c2."userId" IS NULL
  AND c."sessionCartId" = c2."sessionCartId"
  AND (
    c."createdAt" < c2."createdAt"
    OR (c."createdAt" = c2."createdAt" AND c."id" < c2."id")
  );

-- 2) Enforce uniqueness for guest carts only (logged-in carts are keyed by user).
CREATE UNIQUE INDEX IF NOT EXISTS "Cart_sessionCartId_guest_key"
  ON "Cart" ("sessionCartId")
  WHERE "userId" IS NULL;
