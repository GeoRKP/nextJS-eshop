"use client";

import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ChevronRight, ArrowRight } from "lucide-react";
import { Category } from "@/types";
import { getCategoryIcon } from "@/lib/category-icons";

type BrandItem = { brand: string; _count: number };

type Translations = {
  viewAll: string;
  featured: string;
  allCategories: string;
  newArrivals: string;
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
      <div className="fixed inset-0 bg-foreground/70 z-40" onClick={onClose} />
      <div
        ref={panelRef}
        role="menu"
        className="absolute left-0 right-0 z-50 bg-foreground text-background border-t-[3px] border-t-accent border-b border-b-foreground"
        style={{ boxShadow: "0 16px 40px -16px oklch(var(--foreground) / 0.6)" }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {/* Stencil command console header strip */}
        <div className="wrapper !py-2 border-b border-background/10">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-accent">
            ▲ COMMAND ROUTING / CATALOG INDEX
          </span>
        </div>
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
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-10 gap-y-5">
              {columns.map((sub) => {
                const SubIcon = getCategoryIcon(sub.name);
                return (
                  <div key={sub.id}>
                    <Link
                      role="menuitem"
                      href={`/search?category=${encodeURIComponent(sub.name)}`}
                      onClick={onClose}
                      className="flex items-center gap-2 text-accent font-heading font-bold uppercase text-[11px] tracking-[0.18em] hover:text-accent/80 transition-colors mb-2 pb-1.5 border-b border-accent/30"
                    >
                      <SubIcon className="h-4 w-4" />
                      {sub.name}
                    </Link>
                    {sub.children && sub.children.length > 0 && (
                      <ul className="space-y-1">
                        {sub.children.map((item) => (
                          <li key={item.id}>
                            <Link
                              role="menuitem"
                              href={`/search?category=${encodeURIComponent(item.name)}`}
                              onClick={onClose}
                              className="block text-[13px] text-background/65 pl-2 hover:text-accent hover:translate-x-0.5 transition-all py-1"
                            >
                              {item.name}
                              {item._count?.products ? (
                                <span className="font-mono text-[10px] ml-1.5 text-background/40 tracking-[0.05em]">
                                  [{String(item._count.products).padStart(3, "0")}]
                                </span>
                              ) : null}
                            </Link>
                          </li>
                        ))}
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
                className="text-sm text-accent hover:underline font-medium uppercase tracking-[0.12em] font-heading"
              >
                {translations.viewAll} {category.name} →
              </Link>
            </div>
          )}
        </div>

        {/* Right panel: CTA card — workshop info plate with optional image bg */}
        <div className="w-64 shrink-0 hidden xl:flex flex-col rounded-none border border-accent/40 bg-foreground/40 p-5 text-background relative overflow-hidden">
          {category.image && (
            <>
              <Image
                src={category.image}
                alt=""
                fill
                sizes="256px"
                className="object-cover opacity-50"
                aria-hidden="true"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/85 to-foreground/40" aria-hidden="true" />
              <div className="absolute inset-0 bg-blueprint-grid-sm opacity-[0.08]" aria-hidden="true" />
            </>
          )}
          <div className="relative flex flex-col h-full">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-accent mb-3">
              ▲ MODULE
            </span>
            <CategoryIcon className="h-12 w-12 text-accent stroke-[1.5] mb-4" />
            <p className="font-heading font-bold uppercase text-base tracking-[0.06em] leading-tight mb-1">{category.name}</p>
            {category._count?.products ? (
              <p className="font-mono text-[11px] text-background/75 mb-4 tracking-[0.05em]">
                [{String(category._count.products).padStart(4, "0")}] {translations.products.replace("{count}", "").trim()}
              </p>
            ) : null}
            <Link
              href={`/search?category=${encodeURIComponent(category.name)}`}
              onClick={onClose}
              className="mt-auto inline-flex items-center justify-between gap-1 text-[11px] font-bold uppercase tracking-[0.16em] bg-accent text-accent-foreground px-4 py-2.5 rounded-none hover:bg-background hover:text-foreground transition-colors font-heading"
            >
              {translations.viewAll}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
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
        <div className="w-2/5 max-h-[400px] overflow-y-auto border-r border-background/15 pr-3 space-y-px">
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.name);
            const isActive = activeRoot === cat.id;
            return (
              <Link
                key={cat.id}
                href={`/search?category=${encodeURIComponent(cat.name)}`}
                onClick={onClose}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-all ${
                  isActive
                    ? "bg-accent text-accent-foreground font-semibold"
                    : "text-background/80 hover:text-accent hover:bg-background/5"
                }`}
                onMouseEnter={() => handleCategoryHover(cat.id)}
                onMouseLeave={handleCategoryLeave}
              >
                <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-accent-foreground" : "text-background/55"}`} />
                <span className="text-[13px] truncate flex-1">{cat.name}</span>
                <ChevronRight className={`h-3.5 w-3.5 shrink-0 transition-all ${
                  isActive ? "text-accent-foreground" : "text-background/40 opacity-0"
                }`} />
              </Link>
            );
          })}
        </div>

        {/* RIGHT: Subcategories of active category */}
        <div className="flex-1 min-w-0 max-h-[400px] overflow-y-auto">
          {activeCat && (
            <>
              <div className="flex items-center gap-3 mb-4 pb-2 border-b border-background/10">
                <h4 className="font-heading font-bold text-sm uppercase tracking-[0.1em]">{activeCat.name}</h4>
                <Link
                  href={`/search?category=${encodeURIComponent(activeCat.name)}`}
                  onClick={onClose}
                  className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent hover:text-accent/80 transition-colors ml-auto"
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
                        className="flex items-center gap-2 text-accent font-heading font-bold uppercase text-[11px] tracking-[0.18em] hover:text-accent/80 transition-colors mb-2 pb-1.5 border-b border-accent/30"
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
                                className="block text-[13px] text-background/65 pl-2 hover:text-accent hover:translate-x-0.5 transition-all py-1"
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
                className="flex items-center justify-between px-4 py-3 text-sm bg-background/5 border border-background/10 hover:border-accent hover:bg-background/10 hover:text-accent transition-all font-medium uppercase tracking-[0.06em] font-heading"
              >
                <span>{b.brand}</span>
                <span className="font-mono text-[10px] text-background/40 tracking-[0.05em]">
                  [{String(b._count).padStart(3, "0")}]
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
            <h3 className="text-label text-background mb-3">
              {translations.allBrands}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-4">
              {sortedLetters.map((letter) => (
                <div key={letter} id={`brand-letter-${letter}`}>
                  <p className="font-mono text-2xl font-bold text-accent mb-1.5 leading-none border-b border-accent/30 pb-1">
                    {letter}
                  </p>
                  <ul className="space-y-0.5">
                    {grouped[letter].map((b) => (
                      <li key={b.brand}>
                        <Link
                          href={`/search?q=all&category=all&brand=${encodeURIComponent(b.brand)}`}
                          onClick={onClose}
                          className="text-[13px] text-background/75 hover:text-accent transition-colors"
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
            className="hidden lg:flex flex-col gap-0.5 sticky top-0 self-start pl-2 border-l border-background/15"
          >
            {sortedLetters.map((letter) => (
              <button
                key={letter}
                onClick={() => scrollToLetter(letter)}
                className="font-mono text-xs font-bold text-background/55 hover:text-accent transition-colors px-1.5 py-0.5"
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
