// ============================================================================
// Vehicle Compatibility Cross-Reference
// Maps products (by slug) to compatible heavy truck models
// ============================================================================

export type Vehicle = {
  brand: string
  model: string
  yearRange: [number, number] // [fromYear, toYear]
}

// ── Vehicle Definitions ─────────────────────────────────────────────────────

const DAF_CF75: Vehicle = { brand: 'DAF', model: 'CF 75', yearRange: [2001, 2013] }
const DAF_CF85: Vehicle = { brand: 'DAF', model: 'CF 85', yearRange: [2001, 2013] }
const DAF_XF95: Vehicle = { brand: 'DAF', model: 'XF 95', yearRange: [2002, 2006] }
const DAF_XF105: Vehicle = { brand: 'DAF', model: 'XF 105', yearRange: [2005, 2013] }

const MAN_TGA: Vehicle = { brand: 'MAN', model: 'TGA', yearRange: [2000, 2007] }
const MAN_TGS: Vehicle = { brand: 'MAN', model: 'TGS', yearRange: [2007, 2026] }
const MAN_TGX: Vehicle = { brand: 'MAN', model: 'TGX', yearRange: [2007, 2026] }
const MAN_TGL: Vehicle = { brand: 'MAN', model: 'TGL', yearRange: [2005, 2026] }

const MB_ACTROS_MP2: Vehicle = { brand: 'Mercedes-Benz', model: 'Actros MP2', yearRange: [2003, 2008] }
const MB_ACTROS_MP3: Vehicle = { brand: 'Mercedes-Benz', model: 'Actros MP3', yearRange: [2008, 2013] }
const MB_ATEGO: Vehicle = { brand: 'Mercedes-Benz', model: 'Atego', yearRange: [1998, 2026] }
const MB_VARIO: Vehicle = { brand: 'Mercedes-Benz', model: 'Vario', yearRange: [1996, 2013] }
const MB_AXOR: Vehicle = { brand: 'Mercedes-Benz', model: 'Axor', yearRange: [2001, 2013] }

const VOLVO_FH12: Vehicle = { brand: 'Volvo', model: 'FH12', yearRange: [1993, 2005] }
const VOLVO_FH16: Vehicle = { brand: 'Volvo', model: 'FH16', yearRange: [1993, 2026] }
const VOLVO_FM12: Vehicle = { brand: 'Volvo', model: 'FM12', yearRange: [1998, 2005] }
const VOLVO_FM9: Vehicle = { brand: 'Volvo', model: 'FM9', yearRange: [2001, 2005] }

const SCANIA_R420: Vehicle = { brand: 'Scania', model: 'R420', yearRange: [2004, 2017] }
const SCANIA_R480: Vehicle = { brand: 'Scania', model: 'R480', yearRange: [2004, 2017] }
const SCANIA_R560: Vehicle = { brand: 'Scania', model: 'R560', yearRange: [2004, 2017] }
const SCANIA_P230: Vehicle = { brand: 'Scania', model: 'P230', yearRange: [2004, 2017] }
const SCANIA_P270: Vehicle = { brand: 'Scania', model: 'P270', yearRange: [2004, 2017] }
const SCANIA_P340: Vehicle = { brand: 'Scania', model: 'P340', yearRange: [2004, 2017] }

// ── Vehicle Groups ──────────────────────────────────────────────────────────

const ALL_DAF = [DAF_CF75, DAF_CF85, DAF_XF95, DAF_XF105]
const ALL_MAN = [MAN_TGA, MAN_TGS, MAN_TGX, MAN_TGL]
const ALL_MERCEDES = [MB_ACTROS_MP2, MB_ACTROS_MP3, MB_ATEGO, MB_VARIO, MB_AXOR]
const ALL_VOLVO = [VOLVO_FH12, VOLVO_FH16, VOLVO_FM12, VOLVO_FM9]
const ALL_SCANIA = [SCANIA_R420, SCANIA_R480, SCANIA_R560, SCANIA_P230, SCANIA_P270, SCANIA_P340]

const ALL_VEHICLES = [
  ...ALL_DAF,
  ...ALL_MAN,
  ...ALL_MERCEDES,
  ...ALL_VOLVO,
  ...ALL_SCANIA,
]

// ── Product-to-Vehicle Mapping ──────────────────────────────────────────────

export const vehicleCompatibility: Record<string, Vehicle[]> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // GRANAZIA ABS — Brand-specific
  // ═══════════════════════════════════════════════════════════════════════════

  // DAF / MAN gears
  'granazi-abs-48-daf-cf-xf': [...ALL_DAF],
  'granazi-abs-48-man-tga-tgs': [MAN_TGA, MAN_TGS],
  'granazi-abs-80-man-tgx': [MAN_TGX, MAN_TGL],

  // Mercedes gears
  'granazi-abs-100-mercedes-actros': [MB_ACTROS_MP2, MB_ACTROS_MP3],
  'granazi-abs-90-mercedes-atego': [MB_ATEGO, MB_AXOR],
  'granazi-abs-80-mercedes-vario': [MB_VARIO],

  // Volvo / Scania gears
  'granazi-abs-100-volvo-fh-fm': [VOLVO_FH12, VOLVO_FH16, VOLVO_FM12, VOLVO_FM9],
  'granazi-abs-90-scania-r-p': [...ALL_SCANIA],

  // ═══════════════════════════════════════════════════════════════════════════
  // CNC PARTS — Universal (all heavy trucks)
  // ═══════════════════════════════════════════════════════════════════════════

  'mproutzino-daxtylidi-thalamou-cnc': [...ALL_VEHICLES],
  'atsalinos-axonas-frenon-cnc': [...ALL_VEHICLES],
  'alouminenio-emvolo-thalamou-cnc': [...ALL_VEHICLES],
  'vasi-stirixis-dagkanas-cnc': [...ALL_VEHICLES],
  'flantza-syndesis-kompreser-cnc': [...ALL_VEHICLES],

  // ═══════════════════════════════════════════════════════════════════════════
  // DIAPHRAGMS (Fysoynes) — Universal
  // ═══════════════════════════════════════════════════════════════════════════

  // Tampouro diaphragms — universal for all brands
  'fysoynes-me-tampouro-t12-fa1012a': [...ALL_VEHICLES],
  'fysoynes-de-tampouro-t24-fa1034a': [...ALL_VEHICLES],
  'pressaristes-fysoynes-de-tampouro-t24-fa1078c': [...ALL_VEHICLES],
  'enisxymenes-fysoynes-de-tampouro-t24-fa1032a': [...ALL_VEHICLES],
  'fysoynes-dipla-stefania-axona-fa1026a': [...ALL_VEHICLES],
  'fysoynes-speiroma-m16-fa1043d': [...ALL_VEHICLES],
  'fysoynes-me-enisxymenes-t12-fa1055a': [...ALL_VEHICLES],
  'fysoynes-de-pressaristes-enisxymenes-t30-fa1060b': [...ALL_VEHICLES],

  // Disc brake diaphragms — universal AVL
  'fysoynes-me-diskofrenoy-fa1021b': [...ALL_VEHICLES],
  'fysoynes-de-diskofrenoy-t16-24-fa1065b': [...ALL_VEHICLES],
  'enisxymenes-fysoynes-de-diskofrenoy-fa1090a': [...ALL_VEHICLES],
  'fysoynes-dipla-stefania-diskofrenoy-fa1037a': [...ALL_VEHICLES],

  // SORL diaphragms — DAF/MAN and Mercedes specific
  'fysoynes-de-diskofrenoy-sorl-daf-man-35306300050': [...ALL_DAF, ...ALL_MAN],
  'fysoynes-de-diskofrenoy-sorl-alouminioy-35303901710': [...ALL_DAF, ...ALL_MAN, ...ALL_MERCEDES],
  'fysoyna-ms-vario-atego-sorl-35195700030': [MB_VARIO, MB_ATEGO],

  // ═══════════════════════════════════════════════════════════════════════════
  // CONNECTORS (Syndesmoi) — Universal
  // ═══════════════════════════════════════════════════════════════════════════

  'gonia-a-th-aytomati-6mm-ef0310601': [...ALL_VEHICLES],
  'taf-a-th-a-aytomato-6mm-tf0330601': [...ALL_VEHICLES],
  'taf-th-a-th-aytomato-6mm-tf0340601': [...ALL_VEHICLES],
  'taf-mesi-kontra-arseniko-m18x22-tf0441822': [...ALL_VEHICLES],
  'syndesmos-plastikos-aytomatos-ypsilon-pp12304': [...ALL_VEHICLES],
  'syndesmos-vaseos-npt-metalloplastikos-isios-pm1250618': [...ALL_VEHICLES],
  'syndesmos-vaseos-npt-metalloplastikos-gonia-pm1260618': [...ALL_VEHICLES],
  'syndesmos-metallikos-aytomatos-isios-4mm-pf13204': [...ALL_VEHICLES],
  'syndesmos-metallikos-aytomatos-gonia-4mm-pf13304': [...ALL_VEHICLES],
  'syndesmos-metallikos-aytomatos-taf-4mm-pf13404': [...ALL_VEHICLES],
  'syndesmos-vaseos-bsp-metallikos-6-12mm-pf1350612': [...ALL_VEHICLES],
  'syndesmos-vaseos-npt-metallikos-4-18mm-pf1360418': [...ALL_VEHICLES],
  'syndesmos-vaseos-bsp-gonia-metallikos-6-12mm-pf1370612': [...ALL_VEHICLES],
  'syndesmos-vaseos-npt-gonia-metallikos-4-18mm-pf1380418': [...ALL_VEHICLES],
  'syndesmos-oreixalkinos-asfaleias-6-4mm-pb2050604': [...ALL_VEHICLES],
  'syndesmos-oreixalkinos-thyliko-12-64mm-pb2201264': [...ALL_VEHICLES],

  // ═══════════════════════════════════════════════════════════════════════════
  // FITTINGS (Rakor) — Universal
  // ═══════════════════════════════════════════════════════════════════════════

  'rakor-pressarista-3-16-r1at-hb041001ae': [...ALL_VEHICLES],
  'rakor-pressarista-1-8-teflon-hb091001ae': [...ALL_VEHICLES],
  'rakor-vida-gia-thilia-frenon-ba030601': [...ALL_VEHICLES],
  'ladovida-dipli-m6-ba060601': [...ALL_VEHICLES],
  'thilies-aeros-plastikis-solinas-8-6mm-ba020806': [...ALL_VEHICLES],
  'thilies-elastikis-solinas-6-31mm-ba040631': [...ALL_VEHICLES],
  'taf-ydravlikon-frenon-hb051001b': [...ALL_VEHICLES],
  'stavroi-ydravlikon-frenon-hb071001b': [...ALL_VEHICLES],
  'eksaerotires-frenon-m6-hb080601': [...ALL_VEHICLES],
  'valvida-kazanioy-bk22': [...ALL_VEHICLES],

  // Tube inserts — universal
  'solina-aeros-plastiki-2x4mm-pt010204': [...ALL_VEHICLES],
  'antistaseis-plastikis-solinas-2x4mm-it010204': [...ALL_VEHICLES],
  'antistaseis-plastikis-solinas-4x6mm-it010406': [...ALL_VEHICLES],
  'antistaseis-plastikis-solinas-5x8mm-it010508': [...ALL_VEHICLES],
  'antistaseis-plastikis-solinas-6x8mm-it010608': [...ALL_VEHICLES],
  'antistaseis-plastikis-solinas-8x10mm-it010810': [...ALL_VEHICLES],
  'antistaseis-plastikis-solinas-10x12mm-it011012': [...ALL_VEHICLES],
  'antistaseis-plastikis-solinas-12x14mm-it011214': [...ALL_VEHICLES],
  'antistaseis-plastikis-solinas-14x18mm-it011418': [...ALL_VEHICLES],

  // Nipples, couplings, caps — universal
  'arsenika-sidirossolina-m8-3mm-hb010803': [...ALL_VEHICLES],
  'tapes-frenon-m10-hb021001': [...ALL_VEHICLES],
  'moyfes-thylikes-m10-hb031001b': [...ALL_VEHICLES],
  'moyfes-arseniko-thyliko-m10-hb061010': [...ALL_VEHICLES],
  'oyres-plastikis-solinas-6mm-hn010606': [...ALL_VEHICLES],
  'oyres-elastikis-solinas-lina-10-6mm-hn021006': [...ALL_VEHICLES],
  'oyres-komfler-elastikis-solinas-10-6mm-hn031006': [...ALL_VEHICLES],
  'syndetikes-oyres-plastikis-6-14mm-hn04614': [...ALL_VEHICLES],
  'systolikes-oyres-plastikis-6-8mm-hn050608': [...ALL_VEHICLES],
  'taf-plastikis-solinas-6-14mm-hn060614': [...ALL_VEHICLES],
  'arseniko-vasis-oyra-plastiki-solina-12-6mm-hn141206': [...ALL_VEHICLES],
  'thylika-oyra-komfler-18-38mm-hn111838': [...ALL_VEHICLES],
  'moyfes-amerikis-22-12mm-af052212': [...ALL_VEHICLES],
  'moyfes-agglias-6-22mm-af030622': [...ALL_VEHICLES],
  'tapes-arsenikes-m10-af061010': [...ALL_VEHICLES],
  'rodeles-oreixalkou-oring-m12-sr010012': [...ALL_VEHICLES],
  'rodeles-alouminioy-m6-sr030006': [...ALL_VEHICLES],
  'xalkorodeles-m6-sr040006': [...ALL_VEHICLES],
  'mastoi-aeros-komple-22-22mm-rf072222': [...ALL_VEHICLES],
  'mastoi-aeros-komple-26-26mm-rf072626': [...ALL_VEHICLES],

  // Volvo-Scania specific fittings
  'akro-volvo-scania-17-38mm-arseniko-hn131738m': [...ALL_VOLVO, ...ALL_SCANIA],
  'akro-volvo-scania-07-14mm-arseniko-hn130714m': [...ALL_VOLVO, ...ALL_SCANIA],

  // Hoses & tubes — universal
  'solines-metallikes-eykamptes-frenon-3-16-ho1200316': [...ALL_VEHICLES],
  'solines-r6-ladioy-1-4-ho060014': [...ALL_VEHICLES],
  'solina-teflon-skliri-1-syrma-18mm-ho090018': [...ALL_VEHICLES],
  'solina-teflon-eykampti-12mm-ho080012': [...ALL_VEHICLES],
  'solina-flex-petrelaioy-6mm-ho010006': [...ALL_VEHICLES],
  'solina-flex-venzinis-32mm-ho020032': [...ALL_VEHICLES],
  'solina-elastiki-r1-5mm-th01005': [...ALL_VEHICLES],
  'solina-elastiki-r2-6mm-th02006': [...ALL_VEHICLES],
  'kylindriko-syndesmoi-vasis-6-10mm-df010610': [...ALL_VEHICLES],
  'taf-anamonon-sketo-tp020001': [...ALL_VEHICLES],

  // MAN-specific extension
  'proektaseis-regoulatoron-man-sf050893': [...ALL_MAN],

  // ═══════════════════════════════════════════════════════════════════════════
  // HOSE ASSEMBLIES (Markoutsia) — Universal & vehicle-specific
  // ═══════════════════════════════════════════════════════════════════════════

  'markoutsi-teflon-skliro-imieykampto-055m-th010157': [...ALL_VEHICLES],
  'markoutsi-teflon-eykampto-036m-th010157f': [...ALL_VEHICLES],
  'markoutsia-actros-atego-koumpoma-asfaleias-240m-th030240': [MB_ACTROS_MP2, MB_ACTROS_MP3, MB_ATEGO],
  'markoutsia-frenon-amprgiaz-045m-th040145': [...ALL_VEHICLES],
  'markoutsia-grassadorou-030m-th040430': [...ALL_VEHICLES],
  'markoutsia-aytomatis-lipansis-100m-th153261': [...ALL_VEHICLES],
  'syndesmoi-frenon-volvo-sf070018': [...ALL_VOLVO],
}

// ── Helper Functions ────────────────────────────────────────────────────────

/**
 * Returns product slugs compatible with a given vehicle brand and optional model.
 * If only brand is provided, returns products compatible with any model of that brand.
 */
export function getCompatibleProducts(brand: string, model?: string): string[] {
  const normalizedBrand = brand.toLowerCase()
  const normalizedModel = model?.toLowerCase()

  return Object.entries(vehicleCompatibility)
    .filter(([, vehicles]) =>
      vehicles.some((v) => {
        const brandMatch = v.brand.toLowerCase() === normalizedBrand
        if (!brandMatch) return false
        if (!normalizedModel) return true
        return v.model.toLowerCase() === normalizedModel
      })
    )
    .map(([slug]) => slug)
}

/**
 * Returns the list of compatible vehicles for a given product slug.
 * Returns an empty array if the product is not found in the compatibility map.
 */
export function getCompatibleVehicles(productSlug: string): Vehicle[] {
  return vehicleCompatibility[productSlug] ?? []
}
