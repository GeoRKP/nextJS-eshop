import { Link } from "@/i18n/navigation";
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
    <div className="my-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="h2-bold">{t("shopByBrand")}</h2>
        <Link
          href="/search"
          className="text-brand-orange text-sm font-semibold hover:underline flex items-center gap-1"
        >
          {t("viewAll")} →
        </Link>
      </div>
      <BrandShowcaseClient brands={brands} />
    </div>
  );
}
