import { getTranslations } from "next-intl/server";
import BrandShowcaseClient from "./brand-showcase-client";

type BrandItem = { brand: string; _count: number };

export default async function BrandShowcase({
  brands,
}: {
  brands: BrandItem[];
}) {
  const t = await getTranslations("HomePage");
  const tMenu = await getTranslations("MegaMenu");

  if (brands.length === 0) return null;

  return (
    <section className="border-y border-border py-12 md:py-16 bg-muted/30">
      <div className="text-center mb-10 wrapper">
        <span className="text-stamp text-accent block mb-2 hazard-mark">
          {t("trustedBy")}
        </span>
        <h2 className="h2-bold">{t("shopByBrand")}</h2>
      </div>
      <BrandShowcaseClient
        brands={brands.map((b) => ({
          ...b,
          countLabel: tMenu("products", { count: b._count }),
        }))}
      />
    </section>
  );
}
