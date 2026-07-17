import { Product } from "@/types";
import { getTranslations } from "next-intl/server";
import HeroCarousel from "./hero-carousel";

export default async function HeroSection({
  products,
}: {
  product?: Product;
  products?: Product[];
}) {
  const t = await getTranslations("Hero");

  const items = products && products.length > 0 ? products : [];
  if (items.length === 0) return null;

  // Only build slides that exist in the message catalog — extra featured
  // products reuse the defined slides via modulo inside the carousel.
  const slides: { label: string; tagline: string; subtitle: string }[] = [];
  for (let i = 0; i < items.length; i++) {
    if (!t.has(`slides.${i}.label`)) break;
    slides.push({
      label: t(`slides.${i}.label`),
      tagline: t(`slides.${i}.tagline`),
      subtitle: t(`slides.${i}.subtitle`),
    });
  }
  if (slides.length === 0) {
    // No marketing copy defined — the carousel falls back to product data.
    slides.push({ label: "", tagline: "", subtitle: "" });
  }

  return (
    <HeroCarousel
      products={items}
      slides={slides}
      translations={{
        shopNow: t("shopNow"),
      }}
    />
  );
}
