"use client";

import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { Link } from "@/i18n/navigation";
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
  const panelRef = useRef<HTMLDivElement>(null);

  // Auto-focus first link when mega menu opens
  useEffect(() => {
    const panel = panelRef.current;
    if (panel) {
      const firstLink = panel.querySelector<HTMLElement>("a, button");
      firstLink?.focus({ preventScroll: true });
    }
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <>
      <div className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40" onClick={onClose} />
      <div
        ref={panelRef}
        role="menu"
        className="absolute left-0 right-0 z-50 bg-popover/98 backdrop-blur-2xl border-t-2 border-t-brand-accent border-b shadow-elevated"
        style={{ boxShadow: "inset 0 1px 30px -10px hsl(var(--brand-accent) / 0.08), var(--shadow-elevated)" }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className="wrapper !py-6">
          <div className="max-h-[520px] overflow-y-auto">{children}</div>
        </div>
      </div>
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
                      role="menuitem"
                      href={`/search?category=${encodeURIComponent(sub.name)}`}
                      onClick={onClose}
                      className="flex items-center gap-2 text-brand-accent font-bold uppercase text-xs tracking-widest hover:opacity-80 transition-opacity mb-3 pb-1 border-b border-brand-accent/20"
                    >
                      <SubIcon className="h-4 w-4" />
                      {sub.name}
                    </Link>
                    {sub.children && sub.children.length > 0 && (
                      <ul className="space-y-1.5">
                        {sub.children.map((item) => (
                          <li key={item.id}>
                            <Link
                              role="menuitem"
                              href={`/search?category=${encodeURIComponent(item.name)}`}
                              onClick={onClose}
                              className="block text-sm text-muted-foreground hover:text-brand-accent hover:border-l-2 hover:border-brand-accent hover:pl-2 transition-all py-0.5"
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
                            className="text-xs text-brand-accent hover:underline font-medium"
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
                className="text-sm text-brand-accent hover:underline font-medium"
              >
                {translations.viewAll} {category.name} →
              </Link>
            </div>
          )}
        </div>

        {/* Right panel: CTA card — wider */}
        <div className="w-64 shrink-0 hidden xl:flex flex-col items-center justify-center rounded-xl bg-gradient-industrial p-6 text-center text-primary-foreground">
          <CategoryIcon className="h-10 w-10 text-brand-accent/70 mb-3" />
          <p className="text-sm font-bold mb-1">{category.name}</p>
          {category._count?.products ? (
            <p className="text-xs text-primary-foreground/60 mb-3">
              {translations.products.replace(
                "{count}",
                String(category._count.products)
              )}
            </p>
          ) : null}
          <Link
            href={`/search?category=${encodeURIComponent(category.name)}`}
            onClick={onClose}
            className="inline-flex items-center gap-1 text-xs font-bold bg-brand-accent text-white px-4 py-2 rounded-md hover:bg-brand-accent-dark transition-colors"
          >
            {translations.viewAll}
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </MegaMenuShell>
  );
}

/* ─── Mode B: All Categories (Two-Panel Layout) ─── */
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
  const [activeRoot, setActiveRoot] = useState<string | null>(
    categories[0]?.id ?? null
  );
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeCat = categories.find((c) => c.id === activeRoot);

  // Cleanup hover timer on unmount
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  const handleCategoryHover = useCallback((catId: string) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => setActiveRoot(catId), 300);
  }, []);

  const handleCategoryLeave = useCallback(() => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
  }, []);

  return (
    <MegaMenuShell
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClose={onClose}
    >
      <div className="flex gap-6 min-h-[250px]">
        {/* LEFT: Category list — always visible */}
        <div className="w-2/5 max-h-[400px] overflow-y-auto border-r border-border pr-3 space-y-0.5">
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.name);
            const isActive = activeRoot === cat.id;
            return (
              <Link
                key={cat.id}
                href={`/search?category=${encodeURIComponent(cat.name)}`}
                onClick={onClose}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-all ${
                  isActive
                    ? "bg-brand-accent/10 border-l-2 border-brand-accent"
                    : "border-l-2 border-transparent hover:bg-muted/50"
                }`}
                onMouseEnter={() => handleCategoryHover(cat.id)}
                onMouseLeave={handleCategoryLeave}
              >
                <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-brand-accent" : "text-muted-foreground"}`} />
                <span className="text-sm font-medium truncate flex-1">{cat.name}</span>
                <ChevronRight className={`h-3.5 w-3.5 shrink-0 transition-all ${
                  isActive ? "text-brand-accent" : "text-muted-foreground opacity-0"
                }`} />
              </Link>
            );
          })}
        </div>

        {/* RIGHT: Subcategories of active category */}
        <div className="flex-1 min-w-0 max-h-[400px] overflow-y-auto">
          {activeCat && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <h4 className="font-bold text-sm">{activeCat.name}</h4>
                <Link
                  href={`/search?category=${encodeURIComponent(activeCat.name)}`}
                  onClick={onClose}
                  className="text-xs text-brand-accent hover:underline font-medium"
                >
                  {translations.viewAll} →
                </Link>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
                {(activeCat.children ?? []).map((sub) => {
                  const SubIcon = getCategoryIcon(sub.name);
                  return (
                    <div key={sub.id}>
                      <Link
                        role="menuitem"
                        href={`/search?category=${encodeURIComponent(sub.name)}`}
                        onClick={onClose}
                        className="flex items-center gap-2 text-brand-accent font-bold uppercase text-xs tracking-widest hover:opacity-80 transition-opacity mb-2 pb-1 border-b border-brand-accent/20"
                      >
                        <SubIcon className="h-3.5 w-3.5" />
                        {sub.name}
                      </Link>
                      {sub.children && sub.children.length > 0 && (
                        <ul className="space-y-1">
                          {sub.children.map((child) => (
                            <li key={child.id}>
                              <Link
                                role="menuitem"
                                href={`/search?category=${encodeURIComponent(child.name)}`}
                                onClick={onClose}
                                className="block text-sm text-muted-foreground hover:text-brand-accent hover:border-l-2 hover:border-brand-accent hover:pl-2 transition-all py-0.5"
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
            </>
          )}
        </div>
      </div>
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
  const jumpBarRef = useRef<HTMLDivElement>(null);

  // Group brands alphabetically (memoized to avoid recalculation on every render)
  const { grouped, sortedLetters } = useMemo(() => {
    const g: Record<string, BrandItem[]> = {};
    for (const b of brands) {
      const letter = b.brand.charAt(0).toUpperCase();
      if (!g[letter]) g[letter] = [];
      g[letter].push(b);
    }
    return { grouped: g, sortedLetters: Object.keys(g).sort() };
  }, [brands]);

  const scrollToLetter = (letter: string) => {
    const el = document.getElementById(`brand-letter-${letter}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <MegaMenuShell
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClose={onClose}
    >
      {/* Popular brands row — grid cards */}
      {popularBrands.length > 0 && (
        <div className="mb-6">
          <h3 className="text-label text-foreground mb-3">
            {translations.popularBrands}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {popularBrands.map((b) => (
              <Link
                key={b.brand}
                href={`/search?q=all&category=all&brand=${encodeURIComponent(b.brand)}`}
                onClick={onClose}
                className="flex items-center justify-between px-4 py-3 text-sm bg-card border border-border hover:border-brand-accent hover:shadow-card-glow rounded-lg transition-all font-medium"
              >
                <span>{b.brand}</span>
                <span className="text-xs text-muted-foreground">
                  ({b._count})
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Alphabetical listing with jump bar */}
      {sortedLetters.length > 0 && (
        <div className="flex gap-4">
          <div className="flex-1">
            <h3 className="text-label text-foreground mb-3">
              {translations.allBrands}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-4">
              {sortedLetters.map((letter) => (
                <div key={letter} id={`brand-letter-${letter}`}>
                  <p className="text-lg font-black text-brand-accent mb-1">
                    {letter}
                  </p>
                  <ul className="space-y-0.5">
                    {grouped[letter].map((b) => (
                      <li key={b.brand}>
                        <Link
                          href={`/search?q=all&category=all&brand=${encodeURIComponent(b.brand)}`}
                          onClick={onClose}
                          className="text-sm hover:text-brand-accent transition-colors"
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

          {/* A-Z sticky jump bar */}
          <div
            ref={jumpBarRef}
            className="hidden lg:flex flex-col gap-0.5 sticky top-0 self-start pl-2 border-l border-border"
          >
            {sortedLetters.map((letter) => (
              <button
                key={letter}
                onClick={() => scrollToLetter(letter)}
                className="text-xs font-bold text-muted-foreground hover:text-brand-accent transition-colors px-1 py-0.5"
              >
                {letter}
              </button>
            ))}
          </div>
        </div>
      )}
    </MegaMenuShell>
  );
}
