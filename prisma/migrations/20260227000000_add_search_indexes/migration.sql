-- Enable pg_trgm extension for fuzzy/trigram matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create GIN trigram indexes for fuzzy search on key fields
CREATE INDEX IF NOT EXISTS idx_product_name_trgm ON "Product" USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_product_brand_trgm ON "Product" USING GIN (brand gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_product_category_trgm ON "Product" USING GIN (category gin_trgm_ops);

-- Add a generated tsvector column for full-text search
-- Weights: name=A (highest), brand/category=B, description=C
ALTER TABLE "Product"
ADD COLUMN IF NOT EXISTS search_vector tsvector
GENERATED ALWAYS AS (
  setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(brand, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(category, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(description, '')), 'C')
) STORED;

-- Create GIN index on the search_vector for fast full-text queries
CREATE INDEX IF NOT EXISTS idx_product_search_vector ON "Product" USING GIN (search_vector);
