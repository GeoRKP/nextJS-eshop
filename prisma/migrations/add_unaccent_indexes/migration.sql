-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add functional indexes for accent-insensitive search
CREATE INDEX IF NOT EXISTS idx_product_name_unaccent ON "Product" USING gin (unaccent(name) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_product_brand_unaccent ON "Product" USING gin (unaccent(brand) gin_trgm_ops);
