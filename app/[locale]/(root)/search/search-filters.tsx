"use client";

import { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { SlidersHorizontal, ChevronDown, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/lib/utils";
import { useTranslations } from "next-intl";

type CategoryItem = {
  name: string;
  count: number;
  href: string;
  isActive: boolean;
  children?: CategoryItem[];
};

type FilterData = {
  categories: CategoryItem[];
  ratings: { value: number; label: string; href: string; isActive: boolean }[];
  priceRange: { min: number; max: number; currentMin: number; currentMax: number };
  anyHref: { category: string; price: string; rating: string };
  activeCategory: string;
  activePrice: string;
  activeRating: string;
  translations: {
    department: string;
    price: string;
    rating: string;
    any: string;
    filters: string;
    clearFilters: string;
    priceRange: string;
    applyPrice: string;
  };
  clearAllHref: string;
  searchParams: Record<string, string>;
};

type Props = {
  filterData: FilterData;
  filterCount: number;
};

function FilterSection({
  title,
  defaultOpen = true,
  count,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  count?: number;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border/30 pb-4 mb-4 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-1 text-label text-foreground"
      >
        <span className="flex items-center gap-2">
          {title}
          {count !== undefined && count > 0 && (
            <span className="text-[10px] bg-brand-accent/10 text-brand-accent px-1.5 py-0.5 rounded-full font-bold">
              {count}
            </span>
          )}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StarRating({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < count
              ? "fill-brand-accent text-brand-accent"
              : "fill-none text-muted-foreground/40"
          }`}
        />
      ))}
    </span>
  );
}

function PriceSlider({
  priceRange,
  translations,
  searchParams,
}: {
  priceRange: FilterData["priceRange"];
  translations: FilterData["translations"];
  searchParams: FilterData["searchParams"];
}) {
  const router = useRouter();
  const [values, setValues] = useState<[number, number]>([
    priceRange.currentMin,
    priceRange.currentMax,
  ]);

  const handleApply = () => {
    const params = { ...searchParams, price: `${values[0]}-${values[1]}` };
    router.push(`/search?${new URLSearchParams(params).toString()}`);
  };

  return (
    <div className="space-y-4">
      {/* Dual input fields */}
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={values[0]}
          onChange={(e) => setValues([Number(e.target.value), values[1]])}
          className="input-modern text-center text-sm !px-3 !py-2.5"
          step={0.01}
          min={priceRange.min}
          max={values[1]}
        />
        <span className="text-muted-foreground text-xs">—</span>
        <input
          type="number"
          value={values[1]}
          onChange={(e) => setValues([values[0], Number(e.target.value)])}
          className="input-modern text-center text-sm !px-3 !py-2.5"
          step={0.01}
          min={values[0]}
          max={priceRange.max}
        />
      </div>
      <Slider
        min={priceRange.min}
        max={priceRange.max}
        step={1}
        value={values}
        onValueChange={(v) => setValues(v as [number, number])}
      />
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>{formatCurrency(priceRange.min)}</span>
        <span>{formatCurrency(priceRange.max)}</span>
      </div>
      <Button
        size="sm"
        variant="accent"
        className="w-full rounded-lg"
        onClick={handleApply}
      >
        {translations.applyPrice}
      </Button>
    </div>
  );
}

function CategoryNode({ cat }: { cat: CategoryItem }) {
  const tCommon = useTranslations("Common");
  const hasChildren = cat.children && cat.children.length > 0;
  const isChildActive = hasChildren && cat.children!.some((c) => c.isActive);
  const isExpanded = cat.isActive || isChildActive;
  const [open, setOpen] = useState(isExpanded);

  return (
    <li>
      <div className="flex items-center">
        <Link
          className={`text-sm py-2 px-3 flex-1 flex items-center justify-between rounded-lg transition-all ${
            cat.isActive
              ? "font-bold text-accent-foreground bg-accent"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
          href={cat.href}
        >
          <span>{cat.name}</span>
          <span className="text-[10px] tabular-nums bg-muted px-1.5 py-0.5 rounded-full text-muted-foreground">
            {cat.count}
          </span>
        </Link>
        {hasChildren && (
          <button
            onClick={() => setOpen(!open)}
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={tCommon("toggleSubcategories")}
          >
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            />
          </button>
        )}
      </div>
      {hasChildren && (
        <AnimatePresence>
          {open && (
            <motion.ul
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden pl-3 space-y-0.5"
            >
              {cat.children!.map((child) => (
                <li key={child.name}>
                  <Link
                    className={`text-xs py-1.5 px-3 flex items-center justify-between rounded-lg transition-all ${
                      child.isActive
                        ? "font-bold text-accent-foreground bg-accent"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                    href={child.href}
                  >
                    <span>{child.name}</span>
                    <span className="text-[10px] tabular-nums bg-muted px-1.5 py-0.5 rounded-full text-muted-foreground">
                      {child.count}
                    </span>
                  </Link>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      )}
    </li>
  );
}

function FilterContent({ filterData }: { filterData: FilterData }) {
  const { categories, ratings, priceRange, anyHref, translations, clearAllHref, searchParams } =
    filterData;

  const activeCatCount = filterData.activeCategory !== "all" && filterData.activeCategory !== "" ? 1 : 0;
  const activePriceCount = filterData.activePrice !== "all" ? 1 : 0;
  const activeRatingCount = filterData.activeRating !== "all" ? 1 : 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-brand-accent" />
          <h3 className="text-label text-foreground">{translations.filters}</h3>
        </div>
        <Link
          href={clearAllHref}
          className="text-xs text-brand-accent hover:text-brand-accent-dark transition-colors font-medium"
        >
          {translations.clearFilters}
        </Link>
      </div>

      {/* Category filter */}
      <FilterSection title={translations.department} count={activeCatCount}>
        <ul className="space-y-0.5">
          <li>
            <Link
              className={`text-sm py-2 px-3 block rounded-lg transition-all ${
                filterData.activeCategory === "all" ||
                filterData.activeCategory === ""
                  ? "font-bold text-accent-foreground bg-accent"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
              href={anyHref.category}
            >
              {translations.any}
            </Link>
          </li>
          {categories.map((cat) => (
            <CategoryNode key={cat.name} cat={cat} />
          ))}
        </ul>
      </FilterSection>

      {/* Price filter - Slider with inputs */}
      <FilterSection title={translations.priceRange} count={activePriceCount}>
        <PriceSlider
          priceRange={priceRange}
          translations={translations}
          searchParams={searchParams}
        />
      </FilterSection>

      {/* Rating filter */}
      <FilterSection title={translations.rating} count={activeRatingCount}>
        <ul className="space-y-0.5">
          <li>
            <Link
              className={`text-sm py-2 px-3 block rounded-lg transition-all ${
                filterData.activeRating === "all"
                  ? "font-bold text-accent-foreground bg-accent"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
              href={anyHref.rating}
            >
              {translations.any}
            </Link>
          </li>
          {ratings.map((r) => (
            <li key={r.value}>
              <Link
                className={`text-sm py-2 px-3 flex items-center gap-2 rounded-lg transition-all ${
                  r.isActive
                    ? "font-bold text-accent-foreground bg-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
                href={r.href}
              >
                <StarRating count={r.value} />
                <span className="text-xs">{r.label.replace(/^\d+\s*/, '')}</span>
              </Link>
            </li>
          ))}
        </ul>
      </FilterSection>
    </div>
  );
}

export default function SearchFilters({ filterData, filterCount }: Props) {
  return (
    <>
      {/* Mobile: Filter button + Sheet drawer */}
      <div className="md:hidden mb-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full gap-2 rounded-lg">
              <SlidersHorizontal className="h-4 w-4" />
              {filterData.translations.filters}
              {filterCount > 0 && (
                <span className="bg-brand-accent text-accent-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {filterCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[min(320px,90vw)] sm:w-[360px] p-0 overflow-y-auto">
            <div className="sticky top-0 z-10 bg-card border-b border-border px-5 py-4">
              <SheetTitle>
                {filterData.translations.filters}
              </SheetTitle>
            </div>
            <div className="px-5 py-4">
              <FilterContent filterData={filterData} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: Sidebar card - Sticky with accent stripe */}
      <div className="hidden md:block sticky top-24 self-start card-premium overflow-hidden">
        {/* Amber accent stripe */}
        <div className="h-1 bg-gradient-to-r from-brand-accent to-brand-accent-light" />
        <div className="p-5">
          <FilterContent filterData={filterData} />
        </div>
      </div>
    </>
  );
}
