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
import { SlidersHorizontal, ChevronDown, ChevronUp, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/lib/utils";

type FilterData = {
  categories: { name: string; count: number; href: string; isActive: boolean }[];
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
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border/50 pb-4 mb-4 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-1 text-label text-foreground"
      >
        {title}
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
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
          className={`h-4 w-4 ${
            i < count
              ? "fill-yellow-400 text-yellow-400"
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
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium bg-muted px-2.5 py-1 rounded-lg text-xs">{formatCurrency(values[0])}</span>
        <span className="font-medium bg-muted px-2.5 py-1 rounded-lg text-xs">{formatCurrency(values[1])}</span>
      </div>
      <Slider
        min={priceRange.min}
        max={priceRange.max}
        step={10}
        value={values}
        onValueChange={(v) => setValues(v as [number, number])}
      />
      <Button
        size="sm"
        className="w-full rounded-lg bg-brand-orange hover:bg-brand-orange-dark text-white"
        onClick={handleApply}
      >
        {translations.applyPrice}
      </Button>
    </div>
  );
}

function FilterContent({ filterData }: { filterData: FilterData }) {
  const { categories, ratings, priceRange, anyHref, translations, clearAllHref, searchParams } =
    filterData;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-sm">{translations.filters}</h3>
        <Link
          href={clearAllHref}
          className="text-xs text-brand-orange hover:text-brand-orange-dark transition-colors"
        >
          {translations.clearFilters}
        </Link>
      </div>

      {/* Category filter */}
      <FilterSection title={translations.department}>
        <ul className="space-y-0.5">
          <li>
            <Link
              className={`text-sm py-2 px-3 block rounded-lg transition-all ${
                filterData.activeCategory === "all" ||
                filterData.activeCategory === ""
                  ? "font-semibold text-brand-orange bg-brand-orange/5 border-l-2 border-brand-orange"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
              href={anyHref.category}
            >
              {translations.any}
            </Link>
          </li>
          {categories.map((cat) => (
            <li key={cat.name}>
              <Link
                className={`text-sm py-2 px-3 flex items-center justify-between rounded-lg transition-all ${
                  cat.isActive
                    ? "font-semibold text-brand-orange bg-brand-orange/5 border-l-2 border-brand-orange"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
                href={cat.href}
              >
                <span>{cat.name}</span>
                <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full text-muted-foreground">
                  {cat.count}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </FilterSection>

      {/* Price filter - Slider */}
      <FilterSection title={translations.priceRange}>
        <PriceSlider
          priceRange={priceRange}
          translations={translations}
          searchParams={searchParams}
        />
      </FilterSection>

      {/* Rating filter */}
      <FilterSection title={translations.rating}>
        <ul className="space-y-0.5">
          <li>
            <Link
              className={`text-sm py-2 px-3 block rounded-lg transition-all ${
                filterData.activeRating === "all"
                  ? "font-semibold text-brand-orange bg-brand-orange/5 border-l-2 border-brand-orange"
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
                    ? "font-semibold text-brand-orange bg-brand-orange/5 border-l-2 border-brand-orange"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
                href={r.href}
              >
                <StarRating count={r.value} />
                <span className="text-xs">&amp; up</span>
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
            <Button variant="outline" className="w-full gap-2 rounded-xl">
              <SlidersHorizontal className="h-4 w-4" />
              {filterData.translations.filters}
              {filterCount > 0 && (
                <span className="bg-brand-orange text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {filterCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] overflow-y-auto">
            <SheetTitle className="mb-4">
              {filterData.translations.filters}
            </SheetTitle>
            <FilterContent filterData={filterData} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: Sidebar card - Sticky */}
      <div className="hidden md:block sticky top-24 self-start rounded-2xl border border-border/50 p-5 bg-card shadow-card-subtle">
        <FilterContent filterData={filterData} />
      </div>
    </>
  );
}
