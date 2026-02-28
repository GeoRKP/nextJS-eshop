import { getCategoryTree } from "@/lib/actions/category.actions";
import { getAllCategories } from "@/lib/actions/product.actions";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { getCategoryIcon } from "@/lib/category-icons";

export default async function CategoryCards() {
  const t = await getTranslations("Categories");

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
        <h2 className="h2-bold mb-6">{t("shopByCategory")}</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[180px]">
          {treeCategories.map((cat, i) => {
            const Icon = getCategoryIcon(cat.name);
            const subcategoryCount = cat.children?.length ?? 0;
            // First and fourth items are large (span 2 cols, 2 rows) on desktop
            const isLarge = i === 0 || i === 3;

            return (
              <Link
                key={cat.id}
                href={`/search?category=${encodeURIComponent(cat.name)}`}
                className={`group relative flex flex-col items-center justify-center gap-3 rounded-xl bg-card border border-border hover:border-brand-orange/50 hover:shadow-card-hover transition-all duration-200 overflow-hidden ${
                  isLarge ? "lg:col-span-2 lg:row-span-2" : ""
                }`}
              >
                {cat.image ? (
                  <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : null}
                <div className="relative">
                  <Icon
                    className={`text-brand-orange group-hover:scale-110 transition-all duration-200 ${
                      isLarge ? "h-12 w-12" : "h-8 w-8"
                    }`}
                  />
                </div>
                <div className="relative text-center">
                  <p className={`font-bold ${isLarge ? "text-lg" : "text-sm"}`}>
                    {cat.name}
                  </p>
                  {subcategoryCount > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {subcategoryCount} subcategories
                    </p>
                  )}
                  {cat._count?.products ? (
                    <span className="inline-block mt-2 bg-brand-orange/10 text-brand-orange text-xs font-medium px-2.5 py-0.5 rounded-full">
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
      <h2 className="h2-bold mb-6">{t("shopByCategory")}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((cat) => {
          const Icon = getCategoryIcon(cat.category) || ShoppingBag;

          return (
            <Link
              key={cat.category}
              href={`/search?category=${encodeURIComponent(cat.category)}`}
              className="group flex flex-col items-center justify-center gap-3 p-6 md:p-8 rounded-xl bg-card border border-border hover:border-brand-orange/50 hover:shadow-card-hover transition-all duration-200"
            >
              <Icon className="h-8 w-8 text-brand-orange group-hover:scale-110 transition-all duration-200" />
              <div className="text-center">
                <p className="font-bold text-sm">{cat.category}</p>
                <span className="inline-block mt-2 bg-brand-orange/10 text-brand-orange text-xs font-medium px-2.5 py-0.5 rounded-full">
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
