import slugify from "slugify";

// Extend slugify with proper Greek character transliterations.
// By default, slugify maps θ/Θ to "8" instead of "th".
slugify.extend({
  θ: "th",
  Θ: "Th",
});

export function greekSlugify(text: string): string {
  return slugify(text, { lower: true, strict: true });
}
