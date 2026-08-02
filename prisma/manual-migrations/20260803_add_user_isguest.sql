-- Guest checkout: shadow accounts created via "continue as guest".
-- Apply with psql (prisma db push breaks on the generated search_vector column).
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isGuest" BOOLEAN NOT NULL DEFAULT false;
