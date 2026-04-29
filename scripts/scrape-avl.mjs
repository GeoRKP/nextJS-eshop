// Scrape product images from old avl.gr Joomla eshop.
// Pipeline:
//   1. Crawl each main category list page (with pagination) -> collect product URLs
//   2. Visit each product page -> extract resized image URL (skip "no-image" placeholders)
//   3. Download original (500x500) image to public/images/products/{slug}/01.png
//   4. Write avl-mapping.json: { codeLower: { url, image, localPath } }
//
// Run with: node scripts/scrape-avl.mjs

import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const BASE = "https://www.avl.gr";
const OUT_DIR = path.resolve("public/images/products");
const MAPPING_FILE = path.resolve("scripts/avl-mapping.json");

const CATEGORIES = [
  "granazia-abs",
  "eidikes-kataskeves",
  "eksartimata-aerofrenwn",
  "eksartimata-swlinosewn",
  "kataskeves-swlinwn",
];

const MAX_PAGES_PER_CATEGORY = 15;
const PAGE_STEP = 12;

// ─── Fetch helpers ─────────────────────────────────────────────────

async function fetchText(url, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "text/html,application/xhtml+xml",
        },
        redirect: "follow",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} on ${url}`);
      return await res.text();
    } catch (err) {
      if (i === retries) throw err;
      await new Promise((r) => setTimeout(r, 500 * (i + 1)));
    }
  }
}

async function fetchBuffer(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

// ─── Parsing ──────────────────────────────────────────────────────

// Extract product detail URLs from a category list page.
// Product hrefs look like:
//   /eksartimata-aerofrenon/{sub}/{slug}-{code}
//   /eksartimata-solinon-markoytsia/{sub}/{folder}/{slug}-{code}
// We pick anchor hrefs that have at least 2 path segments and end with an alphanumeric code.
function extractProductUrls(html) {
  const urls = new Set();
  const re = /href="((?:https?:\/\/[^"]*?)?\/[a-z][a-z0-9-]+\/[a-z0-9-]+(?:\/[a-z0-9-]+){1,3})"/gi;
  let m;
  while ((m = re.exec(html))) {
    let href = m[1];
    if (href.startsWith("http")) {
      try {
        href = new URL(href).pathname;
      } catch {
        continue;
      }
    }
    // Filter: must NOT be a category list page
    if (href.startsWith("/proionta-eshop/")) continue;
    if (href.includes("?")) continue;
    if (href.endsWith("/")) continue;
    // Must end with something that contains a digit OR letter+digit suffix that looks like a code
    // We'll just collect all matching candidates — page-level dedup handles dupes
    urls.add(href);
  }
  return [...urls];
}

// Extract the resized product image URL from a product detail page.
function extractProductImage(html) {
  // Look for resized images — try full size first (500x500), then thumb.
  const candidates = [
    /\/media\/com_eshop\/products\/resized\/([^"'<>]+?)-500x500\.(png|jpe?g|webp)/i,
    /\/media\/com_eshop\/products\/resized\/([^"'<>]+?)-330x230\.(png|jpe?g|webp)/i,
    /\/media\/com_eshop\/products\/resized\/([^"'<>]+?)-350x145\.(png|jpe?g|webp)/i,
  ];

  for (const re of candidates) {
    const m = html.match(re);
    if (!m) continue;
    const baseName = m[1];
    const ext = m[2];
    if (/^no-image/i.test(baseName)) continue;
    // We try to fetch the original (without resize suffix) first, fallback to 500x500
    return {
      original: `/media/com_eshop/products/${baseName}.${ext}`,
      large: `/media/com_eshop/products/resized/${baseName}-500x500.${ext}`,
      raw: m[0],
    };
  }

  return null;
}

// Code is the last path segment after the final dash.
// /.../fysoynes-m-e-gia-tampoyro-fa1012a -> "fa1012a"
// /.../fysoynes-d-e-diskofrenou-sorl-35306300050 -> "35306300050"
function extractCode(productUrl) {
  const last = productUrl.split("/").pop();
  if (!last) return null;
  // For numeric-only codes, take the trailing digits
  const numMatch = last.match(/(\d{6,})$/);
  if (numMatch) return numMatch[1].toLowerCase();
  // Otherwise take the trailing alphanumeric code (letters + digits, e.g. "fa1012a")
  const codeMatch = last.match(/([a-z]{1,4}\d{2,}[a-z]?)$/i);
  if (codeMatch) return codeMatch[1].toLowerCase();
  return last.toLowerCase();
}

// ─── Crawl phase 1: collect product URLs from category list pages ──

async function crawlCategory(slug) {
  const found = new Set();
  for (let i = 0; i < MAX_PAGES_PER_CATEGORY; i++) {
    const start = i * PAGE_STEP;
    const url = `${BASE}/proionta-eshop/${slug}${start ? `?start=${start}` : ""}`;
    let html;
    try {
      html = await fetchText(url);
    } catch (err) {
      console.warn(`  [WARN] ${url}: ${err.message}`);
      break;
    }
    const before = found.size;
    extractProductUrls(html).forEach((u) => found.add(u));
    const added = found.size - before;
    console.log(`  page ${i + 1} (start=${start}): +${added} new (total ${found.size})`);
    if (added === 0 && i > 0) break; // no new products = end of pagination
  }
  return [...found];
}

async function collectAllProductUrls() {
  const allUrls = new Set();
  for (const cat of CATEGORIES) {
    console.log(`\n[CATEGORY] ${cat}`);
    const urls = await crawlCategory(cat);
    urls.forEach((u) => allUrls.add(u));
    console.log(`  → ${urls.length} URLs from ${cat}`);
  }
  console.log(`\n[TOTAL UNIQUE PRODUCT URLS] ${allUrls.size}`);
  return [...allUrls];
}

// ─── Crawl phase 2: extract image from each product page ───────────

async function processProductPage(productUrl) {
  const fullUrl = BASE + productUrl;
  let html;
  try {
    html = await fetchText(fullUrl);
  } catch (err) {
    return { productUrl, error: err.message };
  }
  const image = extractProductImage(html);
  const code = extractCode(productUrl);
  return { productUrl, code, image };
}

// ─── Phase 3: download image ──────────────────────────────────────

async function downloadImage(imageUrl, code) {
  const dir = path.join(OUT_DIR, code);
  await mkdir(dir, { recursive: true });
  const filename = "01" + path.extname(new URL(BASE + imageUrl).pathname).toLowerCase();
  const localPath = path.join(dir, filename);
  if (existsSync(localPath)) {
    return `/images/products/${code}/${filename}`;
  }
  const buf = await fetchBuffer(BASE + imageUrl);
  await writeFile(localPath, buf);
  return `/images/products/${code}/${filename}`;
}

// ─── Main ─────────────────────────────────────────────────────────

async function main() {
  console.log(`[scrape-avl] Starting crawl of ${BASE}\n`);

  const productUrls = await collectAllProductUrls();
  console.log(`\n[Phase 2] Visiting ${productUrls.length} product pages...\n`);

  const mapping = {};
  let withImage = 0;
  let placeholder = 0;
  let errored = 0;

  for (let i = 0; i < productUrls.length; i++) {
    const productUrl = productUrls[i];
    const result = await processProductPage(productUrl);

    if (result.error) {
      console.log(`[${i + 1}/${productUrls.length}] ERROR ${productUrl}: ${result.error}`);
      errored++;
      continue;
    }

    const { code, image } = result;
    if (!code) continue;

    if (!image) {
      placeholder++;
      mapping[code] = { url: productUrl, image: null, localPath: null };
      if (i % 20 === 0) {
        console.log(`[${i + 1}/${productUrls.length}] no-image  ${productUrl}`);
      }
      continue;
    }

    // Try to download. Prefer original; fallback to large.
    let localPath = null;
    let downloadedUrl = null;
    for (const candidate of [image.original, image.large]) {
      try {
        localPath = await downloadImage(candidate, code);
        downloadedUrl = candidate;
        break;
      } catch (err) {
        // try next
      }
    }

    if (localPath) {
      withImage++;
      mapping[code] = { url: productUrl, image: downloadedUrl, localPath };
      console.log(`[${i + 1}/${productUrls.length}] OK   ${code}  ${localPath}`);
    } else {
      errored++;
      console.log(`[${i + 1}/${productUrls.length}] FAIL ${productUrl} (${image.original})`);
    }
  }

  await mkdir(path.dirname(MAPPING_FILE), { recursive: true });
  await writeFile(MAPPING_FILE, JSON.stringify(mapping, null, 2));

  console.log(`\n[DONE]`);
  console.log(`  Products with images: ${withImage}`);
  console.log(`  Products with no-image placeholder: ${placeholder}`);
  console.log(`  Errors: ${errored}`);
  console.log(`  Mapping written to: ${MAPPING_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
