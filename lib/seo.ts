import { SERVER_URL } from "@/lib/constants";

/**
 * Per-page canonical + hreflang.
 *
 * These used to live in the locale layout, where a single static pair was
 * inherited by every route — so a product page told Google its Greek and
 * English equivalents were both the home page, and nothing had a canonical at
 * all, leaving faceted URLs (?sort, ?price) uncollapsed.
 *
 * @param path Route path without locale prefix, e.g. "/product/abc" or "/".
 */
export function localeAlternates(path: string) {
  const clean = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;

  return {
    canonical: `${SERVER_URL}${clean || "/"}`,
    languages: {
      el: `${SERVER_URL}${clean || "/"}`,
      en: `${SERVER_URL}/en${clean}`,
    },
  };
}
