import { getCategoryTree } from "@/lib/actions/category.actions";
import { getAllCategories } from "@/lib/actions/product.actions";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { ShoppingBag, ArrowRight, ArrowUpRight } from "lucide-react";
import { getCategoryIcon } from "@/lib/category-icons";

// Bento grid pattern: spans for 12-col grid on desktop
// Row 1: 7 + 5, Row 2: 4 + 4 + 4, Row 3: 5 + 7
const bentoSpans = [
  "lg:col-span-7",
  "lg:col-span-5",
  "lg:col-span-4",
  "lg:col-span-4",
  "lg:col-span-4",
  "lg:col-span-5",
  "lg:col-span-7",
];

export default async function CategoryCards() {
  const t = await getTranslations("Categories");
  const tHome = await getTranslations("HomePage");

  // Try hierarchical categories first
  let treeCategories: Awaited<ReturnType<typeof getCategoryTree>> = [];
  try {
    treeCategories = await getCategoryTree();
  } catch {
    // fallback below
  }

  if (treeCategories.length > 0) {
    return (
      <div className="my-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-label text-brand-accent block mb-1">
              {tHome("categoryLabel")}
            </span>
            <h2 className="h2-bold">{t("shopByCategory")}</h2>
          </div>
          <Link
            href="/search"
            className="text-brand-accent text-sm font-semibold hover:underline flex items-center gap-1"
          >
            {tHome("viewAllCategories")}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-12 gap-4 auto-rows-[200px]">
          {treeCategories.map((cat, i) => {
            const Icon = getCategoryIcon(cat.name);
            const subcategoryCount = cat.children?.length ?? 0;
            const span = bentoSpans[i % bentoSpans.length];

            return (
              <Link
                key={cat.id}
                href={`/search?category=${encodeURIComponent(cat.name)}`}
                className={`group relative flex flex-col justify-end rounded-xl overflow-hidden ${span}`}
              >
                {/* Background image or gradient */}
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-industrial" />
                )}
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* Hover arrow top-right */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="h-5 w-5 text-white" />
                </div>

                {/* Content at bottom */}
                <div className="relative p-4 md:p-5">
                  <Icon className="h-7 w-7 text-brand-accent mb-2" />
                  <p className="font-bold text-white text-base md:text-lg">
                    {cat.name}
                  </p>
                  {subcategoryCount > 0 && (
                    <p className="text-xs text-white/60 mt-1">
                      {subcategoryCount} subcategories
                    </p>
                  )}
                  {cat._count?.products ? (
                    <span className="inline-block mt-2 text-brand-accent text-xs font-medium">
                      {t("productCount", { count: cat._count.products })}
                    </span>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  // Fallback to legacy flat categories
  const categories = await getAllCategories();
  if (categories.length === 0) return null;

  return (
    <div className="my-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-label text-brand-accent block mb-1">
            {tHome("categoryLabel")}
          </span>
          <h2 className="h2-bold">{t("shopByCategory")}</h2>
        </div>
        <Link
          href="/search"
          className="text-brand-accent text-sm font-semibold hover:underline flex items-center gap-1"
        >
          {tHome("viewAllCategories")}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-12 gap-4 auto-rows-[200px]">
        {categories.map((cat, i) => {
          const Icon = getCategoryIcon(cat.category) || ShoppingBag;
          const span = bentoSpans[i % bentoSpans.length];

          return (
            <Link
              key={cat.category}
              href={`/search?category=${encodeURIComponent(cat.category)}`}
              className={`group relative flex flex-col justify-end rounded-xl overflow-hidden ${span}`}
            >
              <div className="absolute inset-0 bg-gradient-industrial" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight className="h-5 w-5 text-white" />
              </div>
              <div className="relative p-4 md:p-5">
                <Icon className="h-7 w-7 text-brand-accent mb-2" />
                <p className="font-bold text-white text-base">{cat.category}</p>
                <span className="inline-block mt-2 text-brand-accent text-xs font-medium">
                  {t("productCount", { count: cat._count })}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
