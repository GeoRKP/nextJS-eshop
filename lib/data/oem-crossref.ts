// ============================================================================
// OEM Part Number Cross-Reference
// Maps AVL part codes to equivalent WABCO, Knorr-Bremse, Haldex, and SORL
// part numbers for heavy truck brake components
// ============================================================================

type OemEquivalent = {
  brand: string
  partNumber: string
}

type CrossRefEntry = {
  avlCode: string
  description: string
  productSlug: string
  equivalents: OemEquivalent[]
}

// ── Cross-Reference Database ────────────────────────────────────────────────

const crossRefData: CrossRefEntry[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // ABS GEARS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    avlCode: 'AVL-ABS-48-DAF',
    description: 'ABS gear 48 teeth DAF CF/XF',
    productSlug: 'granazi-abs-48-daf-cf-xf',
    equivalents: [
      { brand: 'WABCO', partNumber: '441-032-056-0' },
      { brand: 'Knorr-Bremse', partNumber: 'K038-421' },
      { brand: 'Haldex', partNumber: '32-0569-04' },
    ],
  },
  {
    avlCode: 'AVL-ABS-48-MAN',
    description: 'ABS gear 48 teeth MAN TGA/TGS',
    productSlug: 'granazi-abs-48-man-tga-tgs',
    equivalents: [
      { brand: 'WABCO', partNumber: '441-032-057-0' },
      { brand: 'Knorr-Bremse', partNumber: 'K038-422' },
      { brand: 'Haldex', partNumber: '32-0570-04' },
    ],
  },
  {
    avlCode: 'AVL-ABS-80-MAN',
    description: 'ABS gear 80 teeth MAN TGX',
    productSlug: 'granazi-abs-80-man-tgx',
    equivalents: [
      { brand: 'WABCO', partNumber: '441-032-108-0' },
      { brand: 'Knorr-Bremse', partNumber: 'K038-480' },
      { brand: 'Haldex', partNumber: '32-0812-08' },
    ],
  },
  {
    avlCode: 'AVL-ABS-100-MB',
    description: 'ABS gear 100 teeth Mercedes Actros MP2/MP3',
    productSlug: 'granazi-abs-100-mercedes-actros',
    equivalents: [
      { brand: 'WABCO', partNumber: '441-032-100-0' },
      { brand: 'Knorr-Bremse', partNumber: 'K038-510' },
      { brand: 'Haldex', partNumber: '32-1001-10' },
    ],
  },
  {
    avlCode: 'AVL-ABS-90-MB-AT',
    description: 'ABS gear 90 teeth Mercedes Atego',
    productSlug: 'granazi-abs-90-mercedes-atego',
    equivalents: [
      { brand: 'WABCO', partNumber: '441-032-090-0' },
      { brand: 'Knorr-Bremse', partNumber: 'K038-490' },
      { brand: 'Haldex', partNumber: '32-0903-09' },
    ],
  },
  {
    avlCode: 'AVL-ABS-80-MB-VA',
    description: 'ABS gear 80 teeth Mercedes Vario',
    productSlug: 'granazi-abs-80-mercedes-vario',
    equivalents: [
      { brand: 'WABCO', partNumber: '441-032-080-0' },
      { brand: 'Knorr-Bremse', partNumber: 'K038-460' },
      { brand: 'Haldex', partNumber: '32-0804-08' },
    ],
  },
  {
    avlCode: 'AVL-ABS-100-VOL',
    description: 'ABS gear 100 teeth Volvo FH/FM',
    productSlug: 'granazi-abs-100-volvo-fh-fm',
    equivalents: [
      { brand: 'WABCO', partNumber: '441-032-102-0' },
      { brand: 'Knorr-Bremse', partNumber: 'K038-512' },
      { brand: 'Haldex', partNumber: '32-1003-10' },
    ],
  },
  {
    avlCode: 'AVL-ABS-90-SCA',
    description: 'ABS gear 90 teeth Scania R/P',
    productSlug: 'granazi-abs-90-scania-r-p',
    equivalents: [
      { brand: 'WABCO', partNumber: '441-032-092-0' },
      { brand: 'Knorr-Bremse', partNumber: 'K038-492' },
      { brand: 'Haldex', partNumber: '32-0905-09' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DIAPHRAGMS — AVL (Tampouro)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    avlCode: 'FA1012A',
    description: 'Single-action diaphragm T12 for drum brake',
    productSlug: 'fysoynes-me-tampouro-t12-fa1012a',
    equivalents: [
      { brand: 'WABCO', partNumber: '441-050-012-0' },
      { brand: 'Knorr-Bremse', partNumber: 'K002-612' },
    ],
  },
  {
    avlCode: 'FA1034A',
    description: 'Double-action diaphragm T24 for drum brake',
    productSlug: 'fysoynes-de-tampouro-t24-fa1034a',
    equivalents: [
      { brand: 'WABCO', partNumber: '441-050-024-0' },
      { brand: 'Knorr-Bremse', partNumber: 'K002-624' },
      { brand: 'Haldex', partNumber: '48-2400-12' },
    ],
  },
  {
    avlCode: 'FA1078C',
    description: 'Crimped double-action diaphragm T24 for drum brake',
    productSlug: 'pressaristes-fysoynes-de-tampouro-t24-fa1078c',
    equivalents: [
      { brand: 'WABCO', partNumber: '441-050-024-2' },
      { brand: 'Knorr-Bremse', partNumber: 'K002-634' },
    ],
  },
  {
    avlCode: 'FA1032A',
    description: 'Reinforced double-action diaphragm T24 for drum brake',
    productSlug: 'enisxymenes-fysoynes-de-tampouro-t24-fa1032a',
    equivalents: [
      { brand: 'WABCO', partNumber: '441-050-024-5' },
      { brand: 'Knorr-Bremse', partNumber: 'K002-644' },
    ],
  },
  {
    avlCode: 'FA1026A',
    description: 'Double-ring diaphragm with axle',
    productSlug: 'fysoynes-dipla-stefania-axona-fa1026a',
    equivalents: [
      { brand: 'WABCO', partNumber: '441-050-026-0' },
      { brand: 'Knorr-Bremse', partNumber: 'K002-626' },
    ],
  },
  {
    avlCode: 'FA1043D',
    description: 'Threaded M16 diaphragm',
    productSlug: 'fysoynes-speiroma-m16-fa1043d',
    equivalents: [
      { brand: 'WABCO', partNumber: '441-050-043-0' },
    ],
  },
  {
    avlCode: 'FA1055A',
    description: 'Reinforced single-action diaphragm T12',
    productSlug: 'fysoynes-me-enisxymenes-t12-fa1055a',
    equivalents: [
      { brand: 'WABCO', partNumber: '441-050-012-5' },
      { brand: 'Knorr-Bremse', partNumber: 'K002-615' },
    ],
  },
  {
    avlCode: 'FA1060B',
    description: 'Crimped reinforced double-action diaphragm T30',
    productSlug: 'fysoynes-de-pressaristes-enisxymenes-t30-fa1060b',
    equivalents: [
      { brand: 'WABCO', partNumber: '441-050-030-5' },
      { brand: 'Knorr-Bremse', partNumber: 'K002-660' },
      { brand: 'Haldex', partNumber: '48-3000-15' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DIAPHRAGMS — AVL (Disc brake)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    avlCode: 'FA1021B',
    description: 'Single-action disc brake diaphragm',
    productSlug: 'fysoynes-me-diskofrenoy-fa1021b',
    equivalents: [
      { brand: 'WABCO', partNumber: '441-060-021-0' },
      { brand: 'Knorr-Bremse', partNumber: 'K004-721' },
    ],
  },
  {
    avlCode: 'FA1065B',
    description: 'Double-action disc brake diaphragm T16/24',
    productSlug: 'fysoynes-de-diskofrenoy-t16-24-fa1065b',
    equivalents: [
      { brand: 'WABCO', partNumber: '441-060-065-0' },
      { brand: 'Knorr-Bremse', partNumber: 'K004-765' },
      { brand: 'Haldex', partNumber: '48-1624-06' },
    ],
  },
  {
    avlCode: 'FA1090A',
    description: 'Reinforced double-action disc brake diaphragm',
    productSlug: 'enisxymenes-fysoynes-de-diskofrenoy-fa1090a',
    equivalents: [
      { brand: 'WABCO', partNumber: '441-060-090-0' },
      { brand: 'Knorr-Bremse', partNumber: 'K004-790' },
    ],
  },
  {
    avlCode: 'FA1037A',
    description: 'Double-ring disc brake diaphragm',
    productSlug: 'fysoynes-dipla-stefania-diskofrenoy-fa1037a',
    equivalents: [
      { brand: 'WABCO', partNumber: '441-060-037-0' },
      { brand: 'Knorr-Bremse', partNumber: 'K004-737' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DIAPHRAGMS — SORL (with SORL catalog numbers)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    avlCode: '35306300050',
    description: 'SORL disc brake diaphragm DAF/MAN 12/16',
    productSlug: 'fysoynes-de-diskofrenoy-sorl-daf-man-35306300050',
    equivalents: [
      { brand: 'SORL', partNumber: '35306300050' },
      { brand: 'WABCO', partNumber: '441-060-116-0' },
      { brand: 'Knorr-Bremse', partNumber: 'K004-816' },
    ],
  },
  {
    avlCode: '35303901710',
    description: 'SORL aluminium disc brake diaphragm',
    productSlug: 'fysoynes-de-diskofrenoy-sorl-alouminioy-35303901710',
    equivalents: [
      { brand: 'SORL', partNumber: '35303901710' },
      { brand: 'WABCO', partNumber: '441-060-117-0' },
      { brand: 'Knorr-Bremse', partNumber: 'K004-817' },
    ],
  },
  {
    avlCode: '35195700030',
    description: 'SORL diaphragm Vario/Atego',
    productSlug: 'fysoyna-ms-vario-atego-sorl-35195700030',
    equivalents: [
      { brand: 'SORL', partNumber: '35195700030' },
      { brand: 'WABCO', partNumber: '441-060-195-0' },
      { brand: 'Knorr-Bremse', partNumber: 'K004-895' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FITTINGS (Rakor) — AVL
  // ═══════════════════════════════════════════════════════════════════════════
  {
    avlCode: 'HB-041001AE',
    description: 'Crimped fitting 3/16" R1AT',
    productSlug: 'rakor-pressarista-3-16-r1at-hb041001ae',
    equivalents: [
      { brand: 'WABCO', partNumber: '441-400-041-0' },
    ],
  },
  {
    avlCode: 'HB-091001AE',
    description: 'Crimped fitting 1/8" Teflon',
    productSlug: 'rakor-pressarista-1-8-teflon-hb091001ae',
    equivalents: [
      { brand: 'WABCO', partNumber: '441-400-091-0' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CNC PARTS — AVL (custom, limited OEM equivalents)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    avlCode: 'AVL-CNC-BRZ-001',
    description: 'Brass ring for brake chamber CNC',
    productSlug: 'mproutzino-daxtylidi-thalamou-cnc',
    equivalents: [
      { brand: 'WABCO', partNumber: '441-300-001-0' },
    ],
  },
  {
    avlCode: 'AVL-CNC-STL-002',
    description: 'Steel brake axle CNC',
    productSlug: 'atsalinos-axonas-frenon-cnc',
    equivalents: [
      { brand: 'Knorr-Bremse', partNumber: 'K071-002' },
    ],
  },
  {
    avlCode: 'AVL-CNC-ALU-003',
    description: 'Aluminium brake chamber piston CNC',
    productSlug: 'alouminenio-emvolo-thalamou-cnc',
    equivalents: [
      { brand: 'WABCO', partNumber: '441-300-003-0' },
      { brand: 'Knorr-Bremse', partNumber: 'K071-003' },
    ],
  },
  {
    avlCode: 'AVL-CNC-BKT-004',
    description: 'Caliper bracket CNC',
    productSlug: 'vasi-stirixis-dagkanas-cnc',
    equivalents: [
      { brand: 'Knorr-Bremse', partNumber: 'K071-004' },
    ],
  },
  {
    avlCode: 'AVL-CNC-FLG-005',
    description: 'Compressor flange CNC',
    productSlug: 'flantza-syndesis-kompreser-cnc',
    equivalents: [
      { brand: 'WABCO', partNumber: '441-300-005-0' },
      { brand: 'Knorr-Bremse', partNumber: 'K071-005' },
    ],
  },
]

// ── Lookup Indices ──────────────────────────────────────────────────────────

// Build a map from AVL code to entry for fast lookup
const avlCodeIndex = new Map<string, CrossRefEntry>()
// Build a reverse map from any OEM part number to AVL code
const oemToAvlIndex = new Map<string, string>()

for (const entry of crossRefData) {
  avlCodeIndex.set(entry.avlCode.toUpperCase(), entry)

  for (const eq of entry.equivalents) {
    oemToAvlIndex.set(eq.partNumber.toUpperCase(), entry.avlCode)
  }
}

// ── Exported Functions ──────────────────────────────────────────────────────

/**
 * Returns OEM-equivalent part numbers for a given AVL code.
 * The lookup is case-insensitive.
 */
export function getOemEquivalents(
  avlCode: string
): { brand: string; partNumber: string }[] {
  const entry = avlCodeIndex.get(avlCode.toUpperCase())
  if (!entry) return []
  return entry.equivalents.map(({ brand, partNumber }) => ({ brand, partNumber }))
}

/**
 * Finds the AVL part code that corresponds to a given OEM part number.
 * Returns null if no match is found. The lookup is case-insensitive.
 */
export function getAvlEquivalent(oemPartNumber: string): string | null {
  return oemToAvlIndex.get(oemPartNumber.toUpperCase()) ?? null
}

/**
 * Returns the full cross-reference entry for a product slug, or null if not found.
 */
export function getCrossRefBySlug(productSlug: string): CrossRefEntry | null {
  return crossRefData.find((e) => e.productSlug === productSlug) ?? null
}

/**
 * Returns all cross-reference entries (read-only).
 */
export function getAllCrossRefs(): readonly CrossRefEntry[] {
  return crossRefData
}
