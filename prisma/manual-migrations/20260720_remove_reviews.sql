-- Remove product reviews entirely (2026-07-20).
-- RUN THIS AT DEPLOY TIME, right after the new container build goes live.
-- The pre-2026-07-20 app still SELECTs Product.rating / Product."numReviews",
-- so dropping these while the old build is running would break every product query.
-- Backups taken 2026-07-20 before this migration:
--   C:\Users\geoka\WebstormProjects\eshops\review-backup-20260720.sql        (23 rows)
--   C:\Users\geoka\WebstormProjects\eshops\reviewreport-backup-20260720.sql  (0 rows)
--
-- Apply (from repo root, DATABASE_URL pointing at the target DB):
--   cat prisma/manual-migrations/20260720_remove_reviews.sql | npx prisma db execute --stdin --schema prisma/schema.prisma
-- or via psql on the Hetzner box:
--   docker exec -i kapda-db-1 psql -U eshop -d eshop < 20260720_remove_reviews.sql

DROP TABLE IF EXISTS "ReviewReport";
DROP TABLE IF EXISTS "Review";

DROP INDEX IF EXISTS "Product_rating_idx";
DROP INDEX IF EXISTS "Product_deletedAt_rating_idx";
ALTER TABLE "Product" DROP COLUMN IF EXISTS "rating";
ALTER TABLE "Product" DROP COLUMN IF EXISTS "numReviews";
