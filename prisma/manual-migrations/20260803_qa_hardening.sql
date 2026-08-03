-- QA hardening batch (2026-08-03).
-- Apply with psql (prisma db push breaks on the generated search_vector column).

-- Guest orders are pinned to the browser session that placed them, so reusing a
-- guest email no longer exposes the previous visitor's order.
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "guestSessionId" UUID;

-- Stock is now reserved when the order is placed, not only when it is paid.
-- Existing rows stay false: they were never reserved, so they must keep
-- decrementing at payment time.
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "stockReserved" BOOLEAN NOT NULL DEFAULT false;

-- English product name snapshot, so /en orders don't show Greek item names.
ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "nameEn" TEXT;

-- Newsletter signups (the footer form used to discard them silently).
CREATE TABLE IF NOT EXISTS "NewsletterSubscriber" (
  "id"             UUID NOT NULL DEFAULT gen_random_uuid(),
  "email"          TEXT NOT NULL,
  "locale"         TEXT NOT NULL DEFAULT 'el',
  "source"         TEXT,
  "isActive"       BOOLEAN NOT NULL DEFAULT true,
  "unsubscribedAt" TIMESTAMP(6),
  "createdAt"      TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "NewsletterSubscriber_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "NewsletterSubscriber_email_key"
  ON "NewsletterSubscriber" ("email");
CREATE INDEX IF NOT EXISTS "NewsletterSubscriber_isActive_idx"
  ON "NewsletterSubscriber" ("isActive");
CREATE INDEX IF NOT EXISTS "NewsletterSubscriber_createdAt_idx"
  ON "NewsletterSubscriber" ("createdAt");
