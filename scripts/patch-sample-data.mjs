// Patch db/sample-data.ts: replace placeholder image paths with downloaded
// avl.gr images (where available). Matching is by product code, extracted as
// the trailing token of each product slug.
//
// Run AFTER scrape-avl.mjs has produced scripts/avl-mapping.json.
// Run with: node scripts/patch-sample-data.mjs

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const SAMPLE_DATA = path.resolve("db/sample-data.ts");
const MAPPING_FILE = path.resolve("scripts/avl-mapping.json");

// Same code-extraction logic as the scraper.
function extractCode(slug) {
  if (!slug) return null;
  const numMatch = slug.match(/(\d{6,})$/);
  if (numMatch) return numMatch[1].toLowerCase();
  const codeMatch = slug.match(/([a-z]{1,4}\d{2,}[a-z]?)$/i);
  if (codeMatch) return codeMatch[1].toLowerCase();
  return null;
}

async function main() {
  const mapping = JSON.parse(await readFile(MAPPING_FILE, "utf8"));
  const src = await readFile(SAMPLE_DATA, "utf8");

  // Stats
  let total = 0;
  let patched = 0;
  let alreadyPatched = 0;
  let noCode = 0;
  let noMatch = 0;
  const matchedCodes = new Set();

  // We work block-by-block. A product block starts with `{` and ends with `},`
  // at the same indentation. Easier: split on `slug: '...'` lines and rewrite
  // the matching `images: [...]` line within each product.
  //
  // We scan all `slug: '...'` occurrences, but only operate on those whose
  // extracted code matches the mapping. The replacement targets the *next*
  // `images: [...]` line after that slug.

  const slugRe = /slug:\s*'([^']+)'/g;
  const matches = [...src.matchAll(slugRe)].map((m) => ({
    slug: m[1],
    pos: m.index,
  }));

  // Build replacement plan: for each slug whose code is in the mapping,
  // find the next `images: [...]` line after `pos`.
  const imagesLineRe = /images:\s*\[\s*'\/images\/placeholder\.svg'\s*\]/;

  let result = src;
  // We must rewrite from end to start so positions stay valid.
  const plan = [];

  for (const { slug, pos } of matches) {
    total++;
    const code = extractCode(slug);
    if (!code) {
      noCode++;
      continue;
    }
    const entry = mapping[code];
    if (!entry || !entry.localPath) {
      noMatch++;
      continue;
    }
    // Find images line after pos
    const tail = src.slice(pos);
    const m = tail.match(imagesLineRe);
    if (!m) {
      // Either already patched, or the format is different
      // Check if this product already references something other than placeholder
      const blockEnd = src.indexOf("},\n", pos);
      const block = src.slice(pos, blockEnd);
      if (block.includes("/images/products/")) {
        alreadyPatched++;
      } else {
        noMatch++;
      }
      continue;
    }
    const absPos = pos + m.index;
    plan.push({
      slug,
      code,
      from: absPos,
      to: absPos + m[0].length,
      replacement: `images: ['${entry.localPath}']`,
    });
    matchedCodes.add(code);
  }

  // Apply in reverse
  plan.sort((a, b) => b.from - a.from);
  for (const op of plan) {
    result = result.slice(0, op.from) + op.replacement + result.slice(op.to);
    patched++;
  }

  if (patched > 0) {
    await writeFile(SAMPLE_DATA, result, "utf8");
  }

  console.log(`\n[patch-sample-data] DONE`);
  console.log(`  Total products in sample-data: ${total}`);
  console.log(`  Patched with avl.gr image:     ${patched}`);
  console.log(`  Already patched (skipped):     ${alreadyPatched}`);
  console.log(`  Slug had no extractable code:  ${noCode}`);
  console.log(`  No matching avl.gr image:      ${noMatch}`);
  console.log(`  Unique codes matched:          ${matchedCodes.size}`);

  // List a few products that didn't match (for debugging)
  if (noMatch > 0) {
    console.log(`\n  First unmatched slugs (sample):`);
    let shown = 0;
    for (const { slug } of matches) {
      const code = extractCode(slug);
      if (!code) continue;
      if (mapping[code] && mapping[code].localPath) continue;
      console.log(`    - ${slug}  (code=${code})`);
      if (++shown >= 10) break;
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
