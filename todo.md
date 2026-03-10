# AVL Truck Parts E-Shop - Tasks

## Phase 1: Database Seeding
- [x] Collect real product data from avl.gr
- [x] Define category hierarchy (5 parents + 15 subcategories)
- [x] Create sample-data.ts with ~100 real products, SKUs, and prices
- [x] Create seed.ts with proper FK relationships (category → product)
- [x] Seed users (2 admin + 4 customers with Greek names)
- [x] Seed coupons (4 marketing scenarios)
- [x] Run `npx prisma db push` to sync schema (server: specs field added)
- [x] Run `npx tsx db/seed.ts` to seed database (server: 103 products, 19 categories, 6 users, 4 coupons, 22 reviews, 10 orders)
- [x] Verify seed output in console (counts per entity)

## Phase 2: Image Assets
- [x] Create placeholder product images per category (11 SVGs: placeholder + 5 categories + 4 banners + hero)
- [x] Create category header images (5 parents) — public/images/categories/*.svg
- [x] Create hero carousel banners for featured products (4 banners 1920x700) — public/images/banners/hero-*.svg
- [x] Download real images from avl.gr catalogs — PDFs downloaded (RAKOR.pdf, FYSOUNES.pdf), scraping plan created

## Phase 3: Data Verification
- [x] Verify products appear in storefront with correct prices — verified (note: ProductPrice uses $ instead of €)
- [x] Verify category filters work (parent + child hierarchy) — verified (note: search sidebar uses flat list, not hierarchy)
- [x] Verify search returns relevant results (Greek terms) — verified (ILIKE works, full-text search needs 'simple' config)
- [x] Verify admin dashboard displays all products — verified (works correctly, lowStockThreshold hardcoded at 5)
- [x] Test price range filtering (€0.05 – €120) — verified (slider step=10 too coarse for small prices)
- [x] Test pagination with 100+ products — verified (9 pages, PAGE_SIZE=12, ellipsis pagination works)

## Phase 4: Content & i18n
- [x] Add English translations for product names in messages/en.json — ProductCatalog section added to both en.json and el.json
- [x] Add English product descriptions — lib/data/product-translations-en.ts (103 products translated)
- [x] Verify Greek characters display correctly in slugs — all 122 slugs valid Latin-only, URL-safe, no duplicates
- [x] Add product specifications as JSON metadata — specs Json? field in schema + specs on all 103 products

## Phase 5: Future Enhancements
- [x] Vehicle compatibility cross-reference — lib/data/vehicle-compatibility.ts (80+ products mapped to DAF, MAN, Mercedes, Volvo, Scania)
- [x] OEM part number cross-reference — lib/data/oem-crossref.ts (35 cross-refs: WABCO, Knorr-Bremse, Haldex, SORL)
- [x] Product weight/dimensions for shipping calculation — lib/data/product-dimensions.ts (103 products with weight, dims, shipping class)
- [x] Seed sample orders and reviews for demo/testing — 22 reviews + 10 orders with 24 line items
- [x] Brand logos for brand showcase component — 6 SVG logos (AVL, Camozzi, SORL, WABCO, Knorr-Bremse, Haldex) + component updated
- [x] Scrape remaining paginated products from avl.gr — research done, scraping plan created at scripts/scraping-plan.md
- [x] Import motorcycle brake parts catalog — lib/data/motorcycle-catalog.ts (17 products, 5 categories)

## Known Issues Found During Verification
- [ ] ProductPrice component shows $ instead of € (components/shared/product/product-price.tsx:15)
- [ ] Price slider step=10 too coarse for €0.05-€3 products (search-filters.tsx:156)
- [ ] Full-text search uses 'english' config — Greek search broken (needs 'simple' or 'greek')
- [ ] Search sidebar shows flat category list, not hierarchical (getAllCategories uses groupBy on text field)
- [ ] Hardcoded English "& up" in rating filter (search-filters.tsx:271)
- [ ] Low stock dashboard query hardcodes threshold at 5, ignores per-product lowStockThreshold
- [ ] slugify library converts θ to 8 instead of th (affects admin product creation form)
