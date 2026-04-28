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
      <div className="my-12 md:my-16 lg:my-20">
        <div className="flex items-end justify-between mb-8 pb-4 border-b border-foreground/15">
          <div>
            <span className="text-stamp text-accent block mb-2 hazard-mark">
              {tHome("categoryLabel")}
            </span>
            <h2 className="h2-bold">{t("shopByCategory")}</h2>
          </div>
          <Link
            href="/search"
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground hover:text-accent transition-colors flex items-center gap-2 border-b border-foreground hover:border-accent pb-1"
          >
            {tHome("viewAllCategories")}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-12 gap-3 auto-rows-[210px] lg:auto-rows-[260px] 2xl:auto-rows-[320px]">
          {treeCategories.map((cat, i) => {
            const Icon = getCategoryIcon(cat.name);
            const subcategoryCount = cat.children?.length ?? 0;
            const span = bentoSpans[i % bentoSpans.length];
            const moduleNum = String(i + 1).padStart(2, "0");

            return (
              <Link
                key={cat.id}
                href={`/search?category=${encodeURIComponent(cat.name)}`}
                className={`group relative flex flex-col justify-end overflow-hidden border border-foreground/15 hover:border-foreground transition-all duration-300 ${span}`}
              >
                {/* Background image or gradient */}
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-industrial bg-blueprint-grid" />
                )}
                {/* Graphite overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent" />

                {/* Yellow scan-bar revealed on hover */}
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-accent origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />

                {/* Top-left module number badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 bg-foreground/85 border border-accent/40">
                  <span className="font-mono text-[10px] font-bold tracking-[0.12em] text-accent">
                    M.{moduleNum}
                  </span>
                </div>

                {/* Top-right arrow */}
                <div className="absolute top-3 right-3 h-7 w-7 flex items-center justify-center bg-accent text-accent-foreground opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="h-4 w-4" />
                </div>

                {/* Content at bottom */}
                <div className="relative p-4 md:p-5">
                  <Icon className="h-7 w-7 text-accent mb-2.5 stroke-[1.75]" />
                  <p className="font-heading font-bold uppercase text-background text-base md:text-lg leading-tight tracking-[0.04em]">
                    {cat.name}
                  </p>
                  <div className="flex items-center gap-2.5 mt-2 text-background/80">
                    {subcategoryCount > 0 && (
                      <span className="font-mono text-[10px] uppercase tracking-[0.1em]">
                        {t("subcategoriesCount", { count: subcategoryCount })}
                      </span>
                    )}
                    {cat._count?.products ? (
                      <span className="font-mono text-[10px] tracking-[0.05em] text-accent">
                        [{String(cat._count.products).padStart(4, "0")}]
                      </span>
                    ) : null}
                  </div>
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
    <div className="my-12 md:my-16 lg:my-20">
      <div className="flex items-end justify-between mb-8 pb-4 border-b border-foreground/15">
        <div>
          <span className="text-stamp text-accent block mb-2 hazard-mark">
            {tHome("categoryLabel")}
          </span>
          <h2 className="h2-bold">{t("shopByCategory")}</h2>
        </div>
        <Link
          href="/search"
          className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground hover:text-accent transition-colors flex items-center gap-2 border-b border-foreground hover:border-accent pb-1"
        >
          {tHome("viewAllCategories")}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-12 gap-3 auto-rows-[210px] lg:auto-rows-[260px] 2xl:auto-rows-[320px]">
        {categories.map((cat, i) => {
          const Icon = getCategoryIcon(cat.name) || ShoppingBag;
          const span = bentoSpans[i % bentoSpans.length];
          const moduleNum = String(i + 1).padStart(2, "0");

          return (
            <Link
              key={cat.name}
              href={`/search?category=${encodeURIComponent(cat.name)}`}
              className={`group relative flex flex-col justify-end overflow-hidden border border-foreground/15 hover:border-foreground transition-all duration-300 ${span}`}
            >
              <div className="absolute inset-0 bg-gradient-industrial bg-blueprint-grid" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-accent origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 bg-foreground/85 border border-accent/40">
                <span className="font-mono text-[10px] font-bold tracking-[0.12em] text-accent">M.{moduleNum}</span>
              </div>
              <div className="absolute top-3 right-3 h-7 w-7 flex items-center justify-center bg-accent text-accent-foreground opacity-0 md:group-hover:opacity-100 transition-opacity">
                <ArrowUpRight className="h-4 w-4" />
              </div>
              <div className="relative p-4 md:p-5">
                <Icon className="h-7 w-7 text-accent mb-2.5 stroke-[1.75]" />
                <p className="font-heading font-bold uppercase text-background text-base leading-tight tracking-[0.04em]">{cat.name}</p>
                <span className="inline-block mt-2 font-mono text-[10px] tracking-[0.05em] text-accent">
                  [{String(cat.productCount ?? 0).padStart(4, "0")}]
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
