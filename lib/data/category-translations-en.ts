/**
 * English translations for category names. Keyed by category `slug` (canonical
 * id-like field). Used by the backfill script to populate `Category.nameEn`,
 * and as a runtime fallback if the DB column is empty.
 */
export const categoryTranslationsEn: Record<
  string,
  { name: string; description?: string }
> = {
  // ── Root categories ──────────────────────────────────────────────
  "granazia-abs": {
    name: "ABS Sensor Gears",
    description: "Precision-machined ABS sensor gears for European trucks.",
  },
  "eidikes-kataskeves": {
    name: "Custom Manufacturing",
    description: "Bespoke CNC machining for one-off and short-run parts.",
  },
  "eksartimata-aerofrenwn": {
    name: "Air Brake Components",
    description: "Bellows, couplers and fittings for pneumatic brake systems.",
  },
  "eksartimata-swlinosewn": {
    name: "Pipe Fittings / Connectors",
    description: "Hydraulic and pneumatic fittings, connectors and adaptors.",
  },
  "kataskeves-swlinwn": {
    name: "Pipe Assemblies / Hoses",
    description: "Made-to-spec brake, clutch and Teflon hose assemblies.",
  },

  // ── Custom Manufacturing children ────────────────────────────────
  "katergasia-tornoy-cnc": {
    name: "CNC Lathe Machining",
  },
  "katergasia-frezas-cnc": {
    name: "CNC Milling",
  },

  // ── Pipe Fittings children ───────────────────────────────────────
  "rakor-frenon": {
    name: "Hydraulic Brake Fittings",
  },
  "antistaseis-solinas": {
    name: "Pipe Resistors & Wedges",
  },
  "oyres-moyfes-tapes": {
    name: "End Fittings, Sleeves & Plugs",
  },
  "solines-lastixa": {
    name: "Pipes & Hoses",
  },

  // ── Air Brake Components children ────────────────────────────────
  "fysoynes-tampouro": {
    name: "Drum Brake Bellows",
  },
  "fysoynes-diskofrenoy": {
    name: "Disc Brake Bellows",
  },
  "aytomatoi-syndesmoi-aeros": {
    name: "Air Quick-Release Couplers",
  },

  // ── ABS Gears children ───────────────────────────────────────────
  "granazia-daf-man": {
    name: "DAF / MAN Sensor Gears",
  },
  "granazia-mercedes": {
    name: "Mercedes Sensor Gears",
  },
  "granazia-volvo-scania": {
    name: "Volvo / Scania Sensor Gears",
  },

  // ── Pipe Assemblies children ─────────────────────────────────────
  "markoutsia-teflon": {
    name: "Teflon Hoses",
  },
  "markoutsia-frenon": {
    name: "Brake & Clutch Hoses",
  },
};
