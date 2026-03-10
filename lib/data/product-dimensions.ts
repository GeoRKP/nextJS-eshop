export type ProductDimensions = {
  weight: number // in kg
  length: number // in cm
  width: number // in cm
  height: number // in cm
  isFragile: boolean
  shippingClass: 'standard' | 'heavy' | 'oversized' | 'small-parts'
}

/**
 * Shipping class priority from lowest to highest.
 * Used by getShippingClass to determine the dominant class in a mixed order.
 */
const SHIPPING_CLASS_PRIORITY: Record<ProductDimensions['shippingClass'], number> = {
  'small-parts': 0,
  standard: 1,
  heavy: 2,
  oversized: 3,
}

// ─── Product dimensions keyed by slug ────────────────────────────────────────

const productDimensionsMap: Record<string, ProductDimensions> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // GRANAZIA ABS (ABS Gears) — steel sensor rings, ~0.5-1.2 kg
  // ═══════════════════════════════════════════════════════════════════════════

  // DAF / MAN
  'granazi-abs-48-daf-cf-xf': {
    weight: 0.65,
    length: 16,
    width: 16,
    height: 4,
    isFragile: false,
    shippingClass: 'standard',
  },
  'granazi-abs-48-man-tga-tgs': {
    weight: 0.65,
    length: 16,
    width: 16,
    height: 4,
    isFragile: false,
    shippingClass: 'standard',
  },
  'granazi-abs-80-man-tgx': {
    weight: 0.95,
    length: 18,
    width: 18,
    height: 4,
    isFragile: false,
    shippingClass: 'standard',
  },

  // Mercedes
  'granazi-abs-100-mercedes-actros': {
    weight: 1.15,
    length: 20,
    width: 20,
    height: 5,
    isFragile: false,
    shippingClass: 'standard',
  },
  'granazi-abs-90-mercedes-atego': {
    weight: 0.9,
    length: 18,
    width: 18,
    height: 5,
    isFragile: false,
    shippingClass: 'standard',
  },
  'granazi-abs-80-mercedes-vario': {
    weight: 0.85,
    length: 17,
    width: 17,
    height: 4,
    isFragile: false,
    shippingClass: 'standard',
  },

  // Volvo / Scania
  'granazi-abs-100-volvo-fh-fm': {
    weight: 1.2,
    length: 20,
    width: 20,
    height: 5,
    isFragile: false,
    shippingClass: 'standard',
  },
  'granazi-abs-90-scania-r-p': {
    weight: 0.95,
    length: 19,
    width: 19,
    height: 5,
    isFragile: false,
    shippingClass: 'standard',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // EIDIKES KATASKEVES CNC (Custom CNC Parts) — brass, steel, aluminium
  // ═══════════════════════════════════════════════════════════════════════════

  // CNC Lathe
  'mproutzino-daxtylidi-thalamou-cnc': {
    weight: 0.35,
    length: 8,
    width: 8,
    height: 5,
    isFragile: false,
    shippingClass: 'standard',
  },
  'atsalinos-axonas-frenon-cnc': {
    weight: 2.4,
    length: 30,
    width: 6,
    height: 6,
    isFragile: false,
    shippingClass: 'heavy',
  },
  'alouminenio-emvolo-thalamou-cnc': {
    weight: 0.55,
    length: 12,
    width: 8,
    height: 8,
    isFragile: false,
    shippingClass: 'standard',
  },

  // CNC Milling
  'vasi-stirixis-dagkanas-cnc': {
    weight: 2.5,
    length: 20,
    width: 15,
    height: 8,
    isFragile: false,
    shippingClass: 'heavy',
  },
  'flantza-syndesis-kompreser-cnc': {
    weight: 1.2,
    length: 18,
    width: 18,
    height: 3,
    isFragile: false,
    shippingClass: 'standard',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FYSOYNES GIA TAMPOURO (Diaphragms for drum brakes) — rubber, ~0.3-0.8 kg
  // ═══════════════════════════════════════════════════════════════════════════
  'fysoynes-me-tampouro-t12-fa1012a': {
    weight: 0.35,
    length: 22,
    width: 22,
    height: 8,
    isFragile: false,
    shippingClass: 'standard',
  },
  'fysoynes-de-tampouro-t24-fa1034a': {
    weight: 0.55,
    length: 26,
    width: 26,
    height: 10,
    isFragile: false,
    shippingClass: 'standard',
  },
  'pressaristes-fysoynes-de-tampouro-t24-fa1078c': {
    weight: 0.65,
    length: 26,
    width: 26,
    height: 10,
    isFragile: false,
    shippingClass: 'standard',
  },
  'enisxymenes-fysoynes-de-tampouro-t24-fa1032a': {
    weight: 0.6,
    length: 26,
    width: 26,
    height: 10,
    isFragile: false,
    shippingClass: 'standard',
  },
  'fysoynes-dipla-stefania-axona-fa1026a': {
    weight: 0.75,
    length: 28,
    width: 28,
    height: 12,
    isFragile: false,
    shippingClass: 'standard',
  },
  'fysoynes-speiroma-m16-fa1043d': {
    weight: 0.45,
    length: 24,
    width: 24,
    height: 9,
    isFragile: false,
    shippingClass: 'standard',
  },
  'fysoynes-me-enisxymenes-t12-fa1055a': {
    weight: 0.4,
    length: 22,
    width: 22,
    height: 8,
    isFragile: false,
    shippingClass: 'standard',
  },
  'fysoynes-de-pressaristes-enisxymenes-t30-fa1060b': {
    weight: 0.8,
    length: 30,
    width: 30,
    height: 12,
    isFragile: false,
    shippingClass: 'standard',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FYSOYNES DISKOFRENOY (Diaphragms for disc brakes) — rubber, ~0.3-0.7 kg
  // ═══════════════════════════════════════════════════════════════════════════
  'fysoynes-me-diskofrenoy-fa1021b': {
    weight: 0.3,
    length: 20,
    width: 20,
    height: 7,
    isFragile: false,
    shippingClass: 'standard',
  },
  'fysoynes-de-diskofrenoy-t16-24-fa1065b': {
    weight: 0.5,
    length: 24,
    width: 24,
    height: 9,
    isFragile: false,
    shippingClass: 'standard',
  },
  'enisxymenes-fysoynes-de-diskofrenoy-fa1090a': {
    weight: 0.55,
    length: 24,
    width: 24,
    height: 10,
    isFragile: false,
    shippingClass: 'standard',
  },
  'fysoynes-dipla-stefania-diskofrenoy-fa1037a': {
    weight: 0.65,
    length: 25,
    width: 25,
    height: 10,
    isFragile: false,
    shippingClass: 'standard',
  },
  'fysoynes-de-diskofrenoy-sorl-daf-man-35306300050': {
    weight: 0.5,
    length: 24,
    width: 24,
    height: 9,
    isFragile: false,
    shippingClass: 'standard',
  },
  'fysoynes-de-diskofrenoy-sorl-alouminioy-35303901710': {
    weight: 0.45,
    length: 24,
    width: 24,
    height: 9,
    isFragile: false,
    shippingClass: 'standard',
  },
  'fysoyna-ms-vario-atego-sorl-35195700030': {
    weight: 0.4,
    length: 22,
    width: 22,
    height: 8,
    isFragile: false,
    shippingClass: 'standard',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // AYTOMATOI SYNDESMOI AEROS (Push-in Connectors) — tiny plastic/brass parts
  // ═══════════════════════════════════════════════════════════════════════════
  'gonia-a-th-aytomati-6mm-ef0310601': {
    weight: 0.025,
    length: 3,
    width: 3,
    height: 3,
    isFragile: false,
    shippingClass: 'small-parts',
  },
  'taf-a-th-a-aytomato-6mm-tf0330601': {
    weight: 0.03,
    length: 4,
    width: 3,
    height: 3,
    isFragile: false,
    shippingClass: 'small-parts',
  },
  'taf-th-a-th-aytomato-6mm-tf0340601': {
    weight: 0.03,
    length: 4,
    width: 3,
    height: 3,
    isFragile: false,
    shippingClass: 'small-parts',
  },
  'taf-mesi-kontra-arseniko-m18x22-tf0441822': {
    weight: 0.04,
    length: 4,
    width: 4,
    height: 3,
    isFragile: false,
    shippingClass: 'small-parts',
  },
  'syndesmos-plastikos-aytomatos-ypsilon-pp12304': {
    weight: 0.02,
    length: 3,
    width: 3,
    height: 3,
    isFragile: false,
    shippingClass: 'small-parts',
  },
  'syndesmos-vaseos-npt-metalloplastikos-isios-pm1250618': {
    weight: 0.03,
    length: 3,
    width: 2,
    height: 2,
    isFragile: false,
    shippingClass: 'small-parts',
  },
  'syndesmos-vaseos-npt-metalloplastikos-gonia-pm1260618': {
    weight: 0.035,
    length: 3,
    width: 3,
    height: 2,
    isFragile: false,
    shippingClass: 'small-parts',
  },
  'syndesmos-metallikos-aytomatos-isios-4mm-pf13204': {
    weight: 0.04,
    length: 3,
    width: 2,
    height: 2,
    isFragile: false,
    shippingClass: 'small-parts',
  },
  'syndesmos-metallikos-aytomatos-gonia-4mm-pf13304': {
    weight: 0.035,
    length: 3,
    width: 3,
    height: 2,
    isFragile: false,
    shippingClass: 'small-parts',
  },
  'syndesmos-metallikos-aytomatos-taf-4mm-pf13404': {
    weight: 0.045,
    length: 4,
    width: 3,
    height: 2,
    isFragile: false,
    shippingClass: 'small-parts',
  },
  'syndesmos-vaseos-bsp-metallikos-6-12mm-pf1350612': {
    weight: 0.04,
    length: 3,
    width: 2,
    height: 2,
    isFragile: false,
    shippingClass: 'small-parts',
  },
  'syndesmos-vaseos-npt-metallikos-4-18mm-pf1360418': {
    weight: 0.03,
    length: 3,
    width: 2,
    height: 2,
    isFragile: false,
    shippingClass: 'small-parts',
  },
  'syndesmos-vaseos-bsp-gonia-metallikos-6-12mm-pf1370612': {
    weight: 0.045,
    length: 3,
    width: 3,
    height: 2,
    isFragile: false,
    shippingClass: 'small-parts',
  },
  'syndesmos-vaseos-npt-gonia-metallikos-4-18mm-pf1380418': {
    weight: 0.035,
    length: 3,
    width: 3,
    height: 2,
    isFragile: false,
    shippingClass: 'small-parts',
  },
  'syndesmos-oreixalkinos-asfaleias-6-4mm-pb2050604': {
    weight: 0.05,
    length: 4,
    width: 3,
    height: 3,
    isFragile: false,
    shippingClass: 'small-parts',
  },
  'syndesmos-oreixalkinos-thyliko-12-64mm-pb2201264': {
    weight: 0.15,
    length: 8,
    width: 5,
    height: 5,
    isFragile: false,
    shippingClass: 'small-parts',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // RAKOR FRENON (Brake Fittings) — small brass/steel parts
  // ═══════════════════════════════════════════════════════════════════════════
  'rakor-pressarista-3-16-r1at-hb041001ae': {
    weight: 0.08,
    length: 4,
    width: 3,
    height: 3,
    isFragile: false,
    shippingClass: 'small-parts',
  },
  'rakor-pressarista-1-8-teflon-hb091001ae': {
    weight: 0.06,
    length: 4,
    width: 3,
    height: 3,
    isFragile: false,
    shippingClass: 'small-parts',
  },
  'rakor-vida-gia-thilia-frenon-ba030601': {
    weight: 0.02,
    length: 3,
    width: 2,
    height: 2,
    isFragile: false,
    shippingClass: 'small-parts',
  },
  'ladovida-dipli-m6-ba060601': {
    weight: 0.05,
    length: 4,
    width: 2,
    height: 2,
    isFragile: false,
    shippingClass: 'small-parts',
  },
  'thilies-aeros-plastikis-solinas-8-6mm-ba020806': {
    weight: 0.06,
    length: 4,
    width: 3,
    height: 3,
    isFragile: false,
    shippingClass: 'small-parts',
  },
  'thilies-elastikis-solinas-6-31mm-ba040631': {
    weight: 0.04,
    length: 4,
    width: 3,
    height: 3,
    isFragile: false,
    shippingClass: 'small-parts',
  },
  'taf-ydravlikon-frenon-hb051001b': {
    weight: 0.12,
    length: 5,
    width: 4,
    height: 3,
    isFragile: false,
    shippingClass: 'small-parts',
  },
  'stavroi-ydravlikon-frenon-hb071001b': {
    weight: 0.15,
    length: 5,
    width: 5,
    height: 3,
    isFragile: false,
    shippingClass: 'small-parts',
  },
  'eksaerotires-frenon-m6-hb080601': {
    weight: 0.02,
    length: 3,
    width: 1,
    height: 1,
    isFragile: false,
    shippingClass: 'small-parts',
  },
  'valvida-kazanioy-bk22': {
    weight: 0.1,
    length: 6,
    width: 3,
    height: 3,
    isFragile: false,
    shippingClass: 'small-parts',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ANTISTASEIS SOLINAS (Tube Inserts / Sleeves) — tiny plastic inserts
  // ═══════════════════════════════════════════════════════════════════════════
  'solina-aeros-plastiki-2x4mm-pt010204': {
    weight: 0.015,
    length: 100,
    width: 1,
    height: 1,
    isFragile: false,
    shippingClass: 'small-parts',
  },
  'antistaseis-plastikis-solinas-2x4mm-it010204': {
    weight: 0.005,
    length: 2,
    width: 1,
    height: 1,
    isFragile: false,
    shippingClass: 'small-parts',
  },
  'antistaseis-plastikis-solinas-4x6mm-it010406': {
    weight: 0.005,
    length: 2,
    width: 1,
    height: 1,
    isFragile: false,
    shippingClass: 'small-parts',
  },
  'antistaseis-plastikis-solinas-5x8mm-it010508': {
    weight: 0.006,
    length: 2,
    width: 1,
    height: 1,
    isFragile: false,
    shippingClass: 'small-parts',
  },
  'antistaseis-plastikis-solinas-6x8mm-it010608': {
    weight: 0.007,
    length: 2,
    width: 1,
    height: 1,
    isFragile: false,
    shippingClass: 'small-parts',
  },
  'antistaseis-plastikis-solinas-8x10mm-it010810': {
    weight: 0.008,
    length: 2,
    width: 1,
    height: 1,
    isFragile: false,
    shippingClass: 'small-parts',
  },
  'antistaseis-plastikis-solinas-10x12mm-it011012': {
    weight: 0.01,
    length: 2,
    width: 2,
    height: 1,
    isFragile: false,
    shippingClass: 'small-parts',
  },
  'antistaseis-plastikis-solinas-12x14mm-it011214': {
    weight: 0.012,
    length: 2,
    width: 2,
    height: 1,
    isFragile: false,
    shippingClass: 'small-parts',
  },
  'antistaseis-plastikis-solinas-14x18mm-it011418': {
    weight: 0.015,
    length: 3,
    width: 2,
    height: 2,
    isFragile: false,
    shippingClass: 'small-parts',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // OYRES, MOYFES & TAPES (Nipples, Couplings & Plugs) — small brass/steel
  // ═══════════════════════════════════════════════════════════════════════════
  'arsenika-sidirossolina-m8-3mm-hb010803': {
    weight: 0.02,
    length: 3,
    width: 2,
    height: 2,
    isFragile: false,
    shippingClass: 'small-parts',
  },
  'tapes-frenon-m10-hb021001': {
    weight: 0.025,
    length: 2,
    width: 2,
    height: 2,
    isFragile: false,
    shippingClass: 'small-parts',
  },
  'moyfes-thylikes-m10-hb031001b': {
    weight: 0.05,
    length: 3,
    width: 2,
    height: 2,
    isFragile: false,
    shippingClass: 'small-parts',
  },
  'moyfes-arseniko-thyliko-m10-hb061010': {
    weight: 0.04,
    length: 3,
    width: 2,
    height: 2,
    isFragile: false,
    shippingClass: 'small-parts',
  },
  'oyres-plastikis-solinas-6mm-hn010606': {
    weight: 0.03,
    length: 4,
    width: 2,
    height: 2,
    isFragile: false,
    shippingClass: 'small-parts',
  },
  'oyres-elastikis-solinas-lina-10-6mm-hn021006': {
    weight: 0.025,
    length: 4,
    width: 2,
    height: 2,
    isFragile: false,
    shippingClass: 'small-parts',
  },
  'oyres-komfler-elastikis-solinas-10-6mm-hn031006': {
    weight: 0.03,
    length: 4,
    width: 2,
    height: 2,
    isFragile: false,
    shippingClass: 'small-parts',
  },
  'syndetikes-oyres-plastikis-6-14mm-hn04614': {
    weight: 0.035,
    length: 4,
    width: 3,
    height: 2,
    isFragile: false,
    shippingClass: 'small-parts',
  },
  'systolikes-oyres-plastikis-6-8mm-hn050608': {
    weight: 0.03,
    length: 3,
    width: 2,
    height: 2,
    isFragile: false,
    shippingClass: 'small-parts',
  },
  'taf-plastikis-solinas-6-14mm-hn060614': {
    weight: 0.06,
    length: 5,
    width: 4,
    height: 3,
    isFragile: false,
    shippingClass: 'small-parts',
  },
  'arseniko-vasis-oyra-plastiki-solina-12-6mm-hn141206': {
    weight: 0.04,
    length: 4,
    width: 2,
    height: 2,
    isFragile: false,
    shippingClass: 'small-parts',
  },
  'thylika-oyra-komfler-18-38mm-hn111838': {
    weight: 0.05,
    length: 5,
    width: 3,
    height: 3,
    isFragile: false,
    shippingClass: 'small-parts',
  },
  'moyfes-amerikis-22-12mm-af052212': {
    weight: 0.06,
    length: 4,
    width: 3,
    height: 3,
    isFragile: false,
    shippingClass: 'small-parts',
  },
  'moyfes-agglias-6-22mm-af030622': {
    weight: 0.05,
    length: 4,
    width: 3,
    height: 3,
    isFragile: false,
    shippingClass: 'small-parts',
  },
  'tapes-arsenikes-m10-af061010': {
    weight: 0.02,
    length: 2,
    width: 2,
    height: 2,
    isFragile: false,
    shippingClass: 'small-parts',
  },
  'rodeles-oreixalkou-oring-m12-sr010012': {
    weight: 0.01,
    length: 2,
    width: 2,
    height: 0.5,
    isFragile: false,
    shippingClass: 'small-parts',
  },
  'rodeles-alouminioy-m6-sr030006': {
    weight: 0.003,
    length: 1,
    width: 1,
    height: 0.3,
    isFragile: false,
    shippingClass: 'small-parts',
  },
  'xalkorodeles-m6-sr040006': {
    weight: 0.005,
    length: 1,
    width: 1,
    height: 0.3,
    isFragile: false,
    shippingClass: 'small-parts',
  },
  'mastoi-aeros-komple-22-22mm-rf072222': {
    weight: 0.12,
    length: 6,
    width: 3,
    height: 3,
    isFragile: false,
    shippingClass: 'small-parts',
  },
  'mastoi-aeros-komple-26-26mm-rf072626': {
    weight: 0.15,
    length: 7,
    width: 4,
    height: 4,
    isFragile: false,
    shippingClass: 'small-parts',
  },

  // Volvo-Scania specific ends
  'akro-volvo-scania-17-38mm-arseniko-hn131738m': {
    weight: 0.08,
    length: 5,
    width: 3,
    height: 3,
    isFragile: false,
    shippingClass: 'small-parts',
  },
  'akro-volvo-scania-07-14mm-arseniko-hn130714m': {
    weight: 0.04,
    length: 4,
    width: 2,
    height: 2,
    isFragile: false,
    shippingClass: 'small-parts',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SOLINES & LASTIXA (Tubes & Hoses) — sold per meter, oversized when long
  // ═══════════════════════════════════════════════════════════════════════════
  'solines-metallikes-eykamptes-frenon-3-16-ho1200316': {
    weight: 0.35,
    length: 100,
    width: 2,
    height: 2,
    isFragile: false,
    shippingClass: 'oversized',
  },
  'solines-r6-ladioy-1-4-ho060014': {
    weight: 0.3,
    length: 100,
    width: 2,
    height: 2,
    isFragile: false,
    shippingClass: 'oversized',
  },
  'solina-teflon-skliri-1-syrma-18mm-ho090018': {
    weight: 0.45,
    length: 100,
    width: 2,
    height: 2,
    isFragile: false,
    shippingClass: 'oversized',
  },
  'solina-teflon-eykampti-12mm-ho080012': {
    weight: 0.25,
    length: 100,
    width: 2,
    height: 2,
    isFragile: false,
    shippingClass: 'oversized',
  },
  'solina-flex-petrelaioy-6mm-ho010006': {
    weight: 0.15,
    length: 100,
    width: 1,
    height: 1,
    isFragile: false,
    shippingClass: 'oversized',
  },
  'solina-flex-venzinis-32mm-ho020032': {
    weight: 0.8,
    length: 100,
    width: 4,
    height: 4,
    isFragile: false,
    shippingClass: 'oversized',
  },
  'solina-elastiki-r1-5mm-th01005': {
    weight: 0.4,
    length: 100,
    width: 2,
    height: 2,
    isFragile: false,
    shippingClass: 'oversized',
  },
  'solina-elastiki-r2-6mm-th02006': {
    weight: 0.5,
    length: 100,
    width: 2,
    height: 2,
    isFragile: false,
    shippingClass: 'oversized',
  },
  'kylindriko-syndesmoi-vasis-6-10mm-df010610': {
    weight: 0.06,
    length: 4,
    width: 2,
    height: 2,
    isFragile: false,
    shippingClass: 'small-parts',
  },
  'taf-anamonon-sketo-tp020001': {
    weight: 0.25,
    length: 8,
    width: 6,
    height: 4,
    isFragile: false,
    shippingClass: 'small-parts',
  },
  'proektaseis-regoulatoron-man-sf050893': {
    weight: 0.1,
    length: 10,
    width: 3,
    height: 3,
    isFragile: false,
    shippingClass: 'small-parts',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MARKOUTSIA TEFLON (Teflon Hose Assemblies) — pre-made hoses with fittings
  // ═══════════════════════════════════════════════════════════════════════════
  'markoutsi-teflon-skliro-imieykampto-055m-th010157': {
    weight: 0.35,
    length: 60,
    width: 4,
    height: 4,
    isFragile: false,
    shippingClass: 'standard',
  },
  'markoutsi-teflon-eykampto-036m-th010157f': {
    weight: 0.25,
    length: 40,
    width: 4,
    height: 4,
    isFragile: false,
    shippingClass: 'standard',
  },
  'markoutsia-actros-atego-koumpoma-asfaleias-240m-th030240': {
    weight: 1.6,
    length: 245,
    width: 4,
    height: 4,
    isFragile: false,
    shippingClass: 'oversized',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MARKOUTSIA FRENON (Brake & Grease Hose Assemblies)
  // ═══════════════════════════════════════════════════════════════════════════
  'markoutsia-frenon-amprgiaz-045m-th040145': {
    weight: 0.3,
    length: 50,
    width: 3,
    height: 3,
    isFragile: false,
    shippingClass: 'standard',
  },
  'markoutsia-grassadorou-030m-th040430': {
    weight: 0.35,
    length: 35,
    width: 3,
    height: 3,
    isFragile: false,
    shippingClass: 'standard',
  },
  'markoutsia-aytomatis-lipansis-100m-th153261': {
    weight: 0.7,
    length: 105,
    width: 3,
    height: 3,
    isFragile: false,
    shippingClass: 'oversized',
  },
  'syndesmoi-frenon-volvo-sf070018': {
    weight: 0.05,
    length: 4,
    width: 3,
    height: 3,
    isFragile: false,
    shippingClass: 'small-parts',
  },
}

// ─── Helper Functions ────────────────────────────────────────────────────────

/**
 * Look up dimensions for a product by slug.
 * Returns null if the slug is not found in the map.
 */
export function getProductDimensions(slug: string): ProductDimensions | null {
  return productDimensionsMap[slug] ?? null
}

/**
 * Calculate the total shipping weight for a list of cart items.
 * Returns the sum of (item weight * quantity) in kg.
 * Items without dimension data are skipped.
 */
export function calculateShippingWeight(
  items: { slug: string; qty: number }[]
): number {
  return items.reduce((total, item) => {
    const dims = productDimensionsMap[item.slug]
    if (!dims) return total
    return total + dims.weight * item.qty
  }, 0)
}

/**
 * Determine the highest shipping class among a set of cart items.
 * Priority: small-parts < standard < heavy < oversized.
 * Returns 'standard' as the default if no items have dimension data.
 */
export function getShippingClass(
  items: { slug: string; qty: number }[]
): ProductDimensions['shippingClass'] {
  let highestPriority = -1
  let highestClass: ProductDimensions['shippingClass'] = 'standard'

  for (const item of items) {
    const dims = productDimensionsMap[item.slug]
    if (!dims) continue

    const priority = SHIPPING_CLASS_PRIORITY[dims.shippingClass]
    if (priority > highestPriority) {
      highestPriority = priority
      highestClass = dims.shippingClass
    }
  }

  return highestClass
}

export { productDimensionsMap }
