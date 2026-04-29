/**
 * Localization helpers for DB-stored content (Category names, Product names,
 * descriptions). The Greek field is canonical; English is opt-in via *En
 * counterparts. When the EN value is missing we fall back to GR so the UI
 * never shows blank.
 */

type Locale = "el" | "en" | string;

/**
 * Pick the localized value of a string field with EN fallback to GR.
 *
 * @example
 *   getLocalized(product, locale, "name")        // product.nameEn ?? product.name
 *   getLocalized(category, locale, "description") // category.descriptionEn ?? category.description
 */
export function getLocalized<
  T extends Record<string, unknown>,
  K extends keyof T & string,
>(obj: T | null | undefined, locale: Locale, base: K): string {
  if (!obj) return "";
  if (locale === "en") {
    const enKey = (base + "En") as keyof T & string;
    const enValue = obj[enKey];
    if (typeof enValue === "string" && enValue.trim().length > 0) {
      return enValue;
    }
  }
  const value = obj[base];
  return typeof value === "string" ? value : "";
}

/**
 * Returns the localized name of a category, falling back to GR if EN is
 * missing. Accepts either the full Category object or a plain { name, nameEn }
 * shape.
 */
export function localizedName(
  obj: { name: string; nameEn?: string | null } | null | undefined,
  locale: Locale,
): string {
  if (!obj) return "";
  if (locale === "en" && obj.nameEn && obj.nameEn.trim().length > 0) {
    return obj.nameEn;
  }
  return obj.name;
}

/**
 * Returns the localized description, falling back to GR if EN is missing.
 */
export function localizedDescription(
  obj:
    | { description: string | null; descriptionEn?: string | null }
    | null
    | undefined,
  locale: Locale,
): string {
  if (!obj) return "";
  if (
    locale === "en" &&
    obj.descriptionEn &&
    obj.descriptionEn.trim().length > 0
  ) {
    return obj.descriptionEn;
  }
  return obj.description ?? "";
}
