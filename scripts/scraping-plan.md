# AVL.gr Product Scraping Plan

## 1. Current State

| Category | Total on avl.gr | Already seeded | To scrape |
|---|---|---|---|
| Eksartimata Aerofrenwn (Air Brakes) | 168 | ~31 | ~137 |
| Eksartimata Swlinosewn (Pipe Fittings) | 1,075 | ~52 | ~1,023 |
| Kataskeves Swlinwn (Hose Constructions) | 6 | ~7 | ~0 |
| Granazia ABS | 0 (no listing) | 8 | 0 |
| Eidikes Kataskeves | 0 (no listing) | 5 | 0 |
| **TOTAL** | **1,249** | **103** | **~1,160** |

> **Note:** Original estimate of ~240 was underestimated. Pipe fittings alone has 1,075 products. Many are size variants.

## 2. Website Structure

- **Platform:** Joomla CMS with `com_eshop` component
- **Pagination:** `?sort_options=a.ordering-ASC&start=N` (12 per page), or `?limit=0` for all
- **TLS:** Must use `www.avl.gr` (bare domain has invalid cert)
- **Images:** `https://www.avl.gr/media/com_eshop/products/resized/{Name}-{WxH}.png`

### HTML Structure (Listing Card)
```html
<div class="col-lg-4 ajax-block-product">
  <div class="eshop-info-block">
    <h5><a href="/path/to/product">Product Name</a></h5>
    <div class="eshop-product-price"><span class="price">X.XX€</span></div>
  </div>
</div>
```

### HTML Structure (Detail Page)
```html
<h1 class="page-title eshop-title">PRODUCT NAME SKU</h1>
<div class="product-sku"><span>SKU_CODE</span></div>
<div class="product-price"><span class="price">X.XX€</span></div>
```

## 3. Scraping Script Design

### Directory: `scripts/scrape-avl/`

| File | Purpose |
|------|---------|
| `config.ts` | Base URL, category list, delays, image sizes |
| `scraper.ts` | Main orchestrator: fetch listings, detail pages |
| `parser.ts` | HTML parsing with cheerio |
| `image-downloader.ts` | Download product images to public/images/products/ |
| `output.ts` | Format data matching sample-data.ts structure |
| `run.ts` | Entry point: `npx tsx scripts/scrape-avl/run.ts` |

### Dependencies
```bash
npm install --save-dev cheerio @types/cheerio
```

### Pipeline
1. Load existing SKU codes from `db/sample-data.ts` for dedup
2. For each category, fetch `?limit=0` listing page
3. Parse product cards (name, URL, thumbnail, price)
4. For each new product, fetch detail page (with 1s delay)
5. Extract: full name, SKU, price, availability, images
6. Download images to `public/images/products/{sku}.png`
7. Map to existing category hierarchy
8. Output `db/scraped-products.ts`

## 4. Category Mapping

### Existing subcategory mappings:
| avl.gr URL path | Our categorySlug |
|---|---|
| `/eksartimata-aerofrenon/fysoynes-*-tampouro` | `fysoynes-tampouro` |
| `/eksartimata-aerofrenon/fysoynes-*-diskofrenou` | `fysoynes-diskofrenoy` |
| `/aftomatoi-syndesmoi-eksartimata-aeros/...` | `aytomatoi-syndesmoi-aeros` |
| `/eksartimata-solinoseon-rakor/rakor-ydravlikon-frenon/...` | `rakor-frenon` |
| `/eksartimata-solinoseon-rakor/antistaseis-*/...` | `antistaseis-solinas` |
| `/eksartimata-solinoseon-rakor/oures-*/...` | `oyres-moyfes-tapes` |
| `/eksartimata-solinoseon-rakor/solines-*/...` | `solines-lastixa` |

### New subcategories needed:
- `rakor-aerofrenon` — Ρακόρ Αεροφρένων
- `moufes-agglias` — Μούφες Αγγλίας
- `moufes-amerikis` — Μούφες Αμερικής
- `mastoi-oreixalkinoi` — Μαστοί Ορειχάλκινοι
- `taxysyndesmoi` — Ταχυσύνδεσμοι
- `bimpikia-oreixalkina` — Μπιμπίκια Ορειχάλκινα

## 5. Phased Approach

### Phase 1 (~240 priority products)
- All auto connectors (aftomatoi-syndesmoi): ~139 new
- Key pipe fitting subcategories: rakor, oures, thylikes: ~80
- Remaining bellows: ~5-10
- **Runtime:** ~20 min (with 1s delay per detail page)

### Phase 2 (~920 remaining products)
- All remaining pipe fitting size variants
- Consider collapsing size variants into single products with options
- **Runtime:** ~60 min

## 6. Price Handling

- Many listing prices show `0.00€` but detail pages have real prices
- Always fetch detail page for accurate price
- Products still showing 0.00: set `price: 0` and add `callForPrice: true` to specs
- Admin can update prices manually later

## 7. Image Handling

- Download `500x500` from detail pages (prefer largest)
- Save to: `public/images/products/{sku-lowercase}.png`
- Skip `no-image` placeholders → use `/images/placeholder.svg`
- ~1,160 images at ~50-100KB each = ~60-115MB
- Consider `.gitignore` for `public/images/products/` and using CDN

## 8. Data Merging Strategy

### Development (destructive seed):
```typescript
// db/all-products.ts
import sampleData from './sample-data'
import scrapedProducts from './scraped-products'
export default {
  ...sampleData,
  products: [...sampleData.products, ...scrapedProducts],
}
```

### Production (non-destructive):
```typescript
// scripts/import-new-products.ts
for (const product of newProducts) {
  await prisma.product.upsert({
    where: { slug: product.slug },
    create: { ...productData },
    update: { price: product.price, images: product.images },
  })
}
```

## 9. Potential Challenges

1. **TLS certificate** — avl.gr bare domain invalid, use `www.avl.gr`
2. **Rate limiting** — 1s delay, `?limit=0` reduces requests
3. **Greek text** — avl.gr uses ALL CAPS, need case normalization
4. **Price discrepancy** — listing vs detail page prices differ
5. **Missing images** — many use `no-image` placeholder
6. **SKU format** — dashes may differ (e.g., "HB-041001AE" vs "HB041001AE")
7. **1,075 pipe fittings** — many size variants, consider grouping

## 10. PDF Catalog Enrichment

After web scraping, parse RAKOR.pdf and FYSOUNES.pdf for supplementary specs:
```bash
npm install --save-dev pdf-parse
```
- Extract size tables, dimensions, pressure ratings
- Enrich `specs` field on matching products by SKU
