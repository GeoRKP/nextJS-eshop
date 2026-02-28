import { getTranslations } from "next-intl/server";
import BrandShowcaseClient from "./brand-showcase-client";

type BrandItem = { brand: string; _count: number };

export default async function BrandShowcase({
  brands,
}: {
  brands: BrandItem[];
}) {
  const t = await getTranslations("HomePage");

  if (brands.length === 0) return null;

  return (
    <section className="border-y border-border/50 py-10">
      <div className="text-center mb-8">
        <span className="text-label text-brand-accent block mb-1">
          {t("trustedBy")}
        </span>
        <h2 className="h2-bold">{t("shopByBrand")}</h2>
      </div>
      <BrandShowcaseClient brands={brands} />
    </section>
  );
}
