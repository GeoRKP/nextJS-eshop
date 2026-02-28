"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { ChevronRight, ArrowRight } from "lucide-react";
import { Category } from "@/types";
import { getCategoryIcon } from "@/lib/category-icons";

type BrandItem = { brand: string; _count: number };

type Translations = {
  viewAll: string;
  featured: string;
  allCategories: string;
  deals: string;
  newArrivals: string;
  shopByBrand: string;
  popularBrands: string;
  allBrands: string;
  viewAllIn: string;
  products: string;
  subcategories: string;
};

type SingleCategoryProps = {
  mode: "single";
  category: Category;
  categories?: never;
  brands?: never;
  translations: Translations;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClose: () => void;
};

type AllCategoriesProps = {
  mode: "all";
  category?: never;
  categories: Category[];
  brands?: never;
  translations: Translations;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClose: () => void;
};

type BrandsProps = {
  mode: "brands";
  category?: never;
  categories?: never;
  brands: BrandItem[];
  translations: Translations;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClose: () => void;
};

type Props = SingleCategoryProps | AllCategoriesProps | BrandsProps;

export default function MegaMenu(props: Props) {
  const { translations, onMouseEnter, onMouseLeave, onClose } = props;

  if (props.mode === "brands") {
    return (
      <BrandsMegaMenu
        brands={props.brands}
        translations={translations}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClose={onClose}
      />
    );
  }

  if (props.mode === "all") {
    return (
      <AllCategoriesMegaMenu
        categories={props.categories}
        translations={translations}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClose={onClose}
      />
    );
  }

  return (
    <SingleCategoryMegaMenu
      category={props.category}
      translations={translations}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClose={onClose}
    />
  );
}

/* ─── Wrapper ─── */
function MegaMenuShell({
  children,
  onMouseEnter,
  onMouseLeave,
  onClose,
}: {
  children: React.ReactNode;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="absolute left-0 right-0 z-50 bg-popover/95 backdrop-blur-xl border-t-4 border-t-brand-orange border-b shadow-elevated"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className="wrapper !py-6">
          <div className="max-h-[480px] overflow-y-auto">{children}</div>
        </div>
      </motion.div>
    </>
  );
}

/* ─── Mode A: Single Category ─── */
function SingleCategoryMegaMenu({
  category,
  translations,
  onMouseEnter,
  onMouseLeave,
  onClose,
}: {
  category: Category;
  translations: Translations;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClose: () => void;
}) {
  const subcategories = category.children ?? [];
  const CategoryIcon = getCategoryIcon(category.name);

  const columns = subcategories.length > 0 ? subcategories : [];

  return (
    <MegaMenuShell
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClose={onClose}
    >
      <div className="flex gap-8 min-h-[240px]">
        {/* Main content: multi-column grid of subcategories */}
        <div className="flex-1 min-w-0">
          {columns.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-10 gap-y-8">
              {columns.map((sub) => {
                const SubIcon = getCategoryIcon(sub.name);
                return (
                  <div key={sub.id}>
                    <Link
                      href={`/search?category=${encodeURIComponent(sub.name)}`}
                      onClick={onClose}
                      className="flex items-center gap-2 text-brand-orange font-bold uppercase text-xs tracking-widest hover:opacity-80 transition-opacity mb-3"
                    >
                      <SubIcon className="h-4 w-4" />
                      {sub.name}
                    </Link>
                    {sub.children && sub.children.length > 0 && (
                      <ul className="space-y-1.5">
                        {sub.children.map((item) => (
                          <li key={item.id}>
                            <Link
                              href={`/search?category=${encodeURIComponent(item.name)}`}
                              onClick={onClose}
                              className="block text-sm text-muted-foreground hover:text-brand-orange transition-colors py-0.5"
                            >
                              {item.name}
                              {item._count?.products ? (
                                <span className="text-xs ml-1 opacity-60">
                                  ({item._count.products})
                                </span>
                              ) : null}
                            </Link>
                          </li>
                        ))}
                        <li>
                          <Link
                            href={`/search?category=${encodeURIComponent(sub.name)}`}
                            onClick={onClose}
                            className="text-xs text-brand-orange hover:underline font-medium"
                          >
                            {translations.viewAll} {sub.name} →
                          </Link>
                        </li>
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <Link
                href={`/search?category=${encodeURIComponent(category.name)}`}
                onClick={onClose}
                className="text-sm text-brand-orange hover:underline font-medium"
              >
                {translations.viewAll} {category.name} →
              </Link>
            </div>
          )}
        </div>

        {/* Right panel: CTA card */}
        <div className="w-52 shrink-0 hidden xl:flex flex-col items-center justify-center rounded-xl bg-gradient-to-br from-brand-orange/10 to-brand-orange/5 border border-brand-orange/20 p-5 text-center">
          <CategoryIcon className="h-10 w-10 text-brand-orange/50 mb-3" />
          <p className="text-sm font-bold mb-1">{category.name}</p>
          {category._count?.products ? (
            <p className="text-xs text-muted-foreground mb-3">
              {translations.products.replace(
                "{count}",
                String(category._count.products)
              )}
            </p>
          ) : null}
          <Link
            href={`/search?category=${encodeURIComponent(category.name)}`}
            onClick={onClose}
            className="inline-flex items-center gap-1 text-xs font-bold bg-brand-orange text-white px-4 py-2 rounded-md hover:bg-brand-orange-dark transition-colors"
          >
            {translations.viewAll}
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </MegaMenuShell>
  );
}

/* ─── Mode B: All Categories ─── */
function AllCategoriesMegaMenu({
  categories,
  translations,
  onMouseEnter,
  onMouseLeave,
  onClose,
}: {
  categories: Category[];
  translations: Translations;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClose: () => void;
}) {
  const [activeRoot, setActiveRoot] = useState<string | null>(null);
  const activeCat = categories.find((c) => c.id === activeRoot);

  return (
    <MegaMenuShell
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClose={onClose}
    >
      {!activeCat ? (
        /* Grid of root category cards */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.name);
            const subCount = cat.children?.length ?? 0;
            return (
              <button
                key={cat.id}
                className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:border-brand-orange/50 hover:shadow-md transition-all text-left group"
                onMouseEnter={() => setActiveRoot(cat.id)}
              >
                <div className="h-10 w-10 rounded-lg bg-brand-orange/10 flex items-center justify-center shrink-0 group-hover:bg-brand-orange/20 transition-colors">
                  <Icon className="h-5 w-5 text-brand-orange" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{cat.name}</p>
                  {subCount > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {translations.subcategories.replace(
                        "{count}",
                        String(subCount)
                      )}
                    </p>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto shrink-0 opacity-0 group-hover:opacity-100 group-hover:text-brand-orange transition-all" />
              </button>
            );
          })}
        </div>
      ) : (
        /* Expanded view for hovered category */
        <div>
          <button
            onClick={() => setActiveRoot(null)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-brand-orange mb-4 transition-colors"
          >
            ← {translations.allCategories}
          </button>
          <div className="flex items-center gap-2 mb-4">
            <h4 className="font-bold text-sm">{activeCat.name}</h4>
            <Link
              href={`/search?category=${encodeURIComponent(activeCat.name)}`}
              onClick={onClose}
              className="text-xs text-brand-orange hover:underline font-medium"
            >
              {translations.viewAll} →
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-10 gap-y-6">
            {(activeCat.children ?? []).map((sub) => {
              const SubIcon = getCategoryIcon(sub.name);
              return (
                <div key={sub.id}>
                  <Link
                    href={`/search?category=${encodeURIComponent(sub.name)}`}
                    onClick={onClose}
                    className="flex items-center gap-2 text-brand-orange font-bold uppercase text-xs tracking-widest hover:opacity-80 transition-opacity mb-2"
                  >
                    <SubIcon className="h-3.5 w-3.5" />
                    {sub.name}
                  </Link>
                  {sub.children && sub.children.length > 0 && (
                    <ul className="space-y-1">
                      {sub.children.map((child) => (
                        <li key={child.id}>
                          <Link
                            href={`/search?category=${encodeURIComponent(child.name)}`}
                            onClick={onClose}
                            className="block text-sm text-muted-foreground hover:text-brand-orange transition-colors py-0.5"
                          >
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </MegaMenuShell>
  );
}

/* ─── Mode C: Brands ─── */
function BrandsMegaMenu({
  brands,
  translations,
  onMouseEnter,
  onMouseLeave,
  onClose,
}: {
  brands: BrandItem[];
  translations: Translations;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClose: () => void;
}) {
  const popularBrands = brands.slice(0, 8);

  // Group brands alphabetically
  const grouped: Record<string, BrandItem[]> = {};
  for (const b of brands) {
    const letter = b.brand.charAt(0).toUpperCase();
    if (!grouped[letter]) grouped[letter] = [];
    grouped[letter].push(b);
  }
  const sortedLetters = Object.keys(grouped).sort();

  return (
    <MegaMenuShell
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClose={onClose}
    >
      {/* Popular brands row */}
      {popularBrands.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wide mb-3">
            {translations.popularBrands}
          </h3>
          <div className="flex flex-wrap gap-2">
            {popularBrands.map((b) => (
              <Link
                key={b.brand}
                href={`/search?q=all&category=all&brand=${encodeURIComponent(b.brand)}`}
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm bg-brand-orange/10 hover:bg-brand-orange/20 rounded-full transition-colors font-medium"
              >
                {b.brand}
                <span className="text-xs text-muted-foreground">
                  ({b._count})
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Alphabetical listing */}
      {sortedLetters.length > 0 && (
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide mb-3">
            {translations.allBrands}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-4">
            {sortedLetters.map((letter) => (
              <div key={letter}>
                <p className="text-lg font-black text-brand-orange mb-1">
                  {letter}
                </p>
                <ul className="space-y-0.5">
                  {grouped[letter].map((b) => (
                    <li key={b.brand}>
                      <Link
                        href={`/search?q=all&category=all&brand=${encodeURIComponent(b.brand)}`}
                        onClick={onClose}
                        className="text-sm hover:text-brand-orange transition-colors"
                      >
                        {b.brand}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </MegaMenuShell>
  );
}
