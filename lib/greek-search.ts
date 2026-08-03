import { Prisma } from "@prisma/client";

/**
 * Greek final sigma folding for search.
 *
 * Postgres `lower()` is not context-sensitive: LOWER('ΦΥΣΟΥΝΕΣ') is 'φυσουνεσ'
 * with a regular sigma, while the stored 'Φυσούνες' lowercases to 'φυσουνες'
 * with a final sigma. ILIKE therefore missed every capitalised Greek word
 * ending in -Σ — which is most plurals. `unaccent` does not help: ς is not an
 * accented character.
 *
 * Folding ς → σ on both sides fixes it. Note this must come AFTER lower(),
 * since only lowercase text can contain a final sigma.
 */
export function foldGreek(value: string): string {
  return value.toLowerCase().replace(/ς/g, "σ");
}

/** `translate(lower(unaccent(<expr>)), 'ς', 'σ')` as a composable SQL fragment. */
export function foldGreekSql(expr: Prisma.Sql): Prisma.Sql {
  return Prisma.sql`translate(lower(unaccent(${expr})), 'ς', 'σ')`;
}

/** Same, for databases without the unaccent extension. */
export function foldGreekSqlNoUnaccent(expr: Prisma.Sql): Prisma.Sql {
  return Prisma.sql`translate(lower(${expr}), 'ς', 'σ')`;
}
