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

  const slides = items.map((_, i) => ({
    label: t(`slides.${i}.label`),
    tagline: t(`slides.${i}.tagline`),
    subtitle: t(`slides.${i}.subtitle`),
  }));

  return (
    <HeroCarousel
      products={items}
      slides={slides}
      translations={{
        shopNow: t("shopNow"),
        browseCollection: t("browseCollection"),
      }}
    />
  );
}
