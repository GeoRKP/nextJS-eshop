-- Fix full-text search for Greek text: change from 'english' to 'simple' config.
-- The 'simple' configuration tokenizes and lowercases without language-specific
-- stemming, which works correctly for Greek (and all other languages).

-- Drop the existing GIN index on search_vector
DROP INDEX IF EXISTS idx_product_search_vector;

-- Drop the existing generated column (cannot ALTER a GENERATED column in-place)
ALTER TABLE "Product" DROP COLUMN IF EXISTS search_vector;

-- Recreate the search_vector column with 'simple' text search configuration
ALTER TABLE "Product"
ADD COLUMN search_vector tsvector
GENERATED ALWAYS AS (
  setweight(to_tsvector('simple', coalesce(name, '')), 'A') ||
  setweight(to_tsvector('simple', coalesce(brand, '')), 'B') ||
  setweight(to_tsvector('simple', coalesce(category, '')), 'B') ||
  setweight(to_tsvector('simple', coalesce(description, '')), 'C')
) STORED;

-- Recreate the GIN index for fast full-text queries
CREATE INDEX idx_product_search_vector ON "Product" USING GIN (search_vector);
