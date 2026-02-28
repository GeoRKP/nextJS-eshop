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

  return (
    <HeroCarousel
      products={items}
      translations={{
        tagline: t("tagline"),
        subtitle: t("subtitle"),
        shopNow: t("shopNow"),
        browseCollection: t("browseCollection"),
      }}
    />
  );
}
