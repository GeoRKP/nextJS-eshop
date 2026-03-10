"use client";

import { useState, useRef, useCallback } from "react";
import { Link } from "@/i18n/navigation";
import { Grid3X3, ChevronDown, Sparkles, Tag, Layers } from "lucide-react";
import { Category } from "@/types";
import { getCategoryIcon } from "@/lib/category-icons";
import MegaMenu from "./mega-menu";

type BrandItem = { brand: string; _count: number };

type Props = {
  categories: Category[];
  brands: BrandItem[];
  translations: {
    allCategories: string;
    viewAll: string;
    deals: string;
    newArrivals: string;
    featured: string;
    shopByBrand: string;
    popularBrands: string;
    allBrands: string;
    viewAllIn: string;
    products: string;
    subcategories: string;
  };
};

export default function CategoryNavClient({
  categories,
  brands,
  translations,
}: Props) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = useCallback((categoryId: string) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setActiveCategory(categoryId);
  }, []);

  const handleMouseLeave = useCallback(() => {
    closeTimerRef.current = setTimeout(() => {
      setActiveCategory(null);
    }, 300);
  }, []);

  const handleClick = useCallback((categoryId: string) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setActiveCategory((prev) => (prev === categoryId ? null : categoryId));
  }, []);

  const handleMegaMenuEnter = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const handleMegaMenuLeave = useCallback(() => {
    closeTimerRef.current = setTimeout(() => {
      setActiveCategory(null);
    }, 200);
  }, []);

  const activeCategoryData = categories.find((c) => c.id === activeCategory);

  return (
    <div ref={navRef} className="relative">
      <nav className="hidden md:block bg-primary text-primary-foreground relative z-[45]">
        <div className="wrapper flex items-center gap-0 h-11 !py-0 overflow-hidden">
          {/* All Categories button */}
          <button
            className={`flex items-center gap-1.5 px-4 h-full font-heading text-[13px] font-semibold uppercase tracking-wide transition-all ${
              activeCategory === "__all__"
                ? "bg-brand-accent/15 border-b-2 border-brand-accent text-white"
                : "hover:border-b-2 hover:border-brand-accent/50"
            }`}
            onMouseEnter={() => handleMouseEnter("__all__")}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick("__all__")}
          >
            <Grid3X3 className="h-4 w-4" />
            {translations.allCategories}
            <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${activeCategory === "__all__" ? "rotate-180" : ""}`} />
          </button>

          <div className="h-4 w-px bg-primary-foreground/10 mx-1" />

          {/* Root category items with icons */}
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.name);
            const isActive = activeCategory === category.id;
            return (
              <button
                key={category.id}
                className={`flex items-center gap-1.5 px-3 h-full font-heading text-[13px] font-semibold uppercase tracking-wide transition-all ${
                  isActive
                    ? "bg-brand-accent/15 border-b-2 border-brand-accent text-white"
                    : "hover:border-b-2 hover:border-brand-accent/50"
                }`}
                onMouseEnter={() => handleMouseEnter(category.id)}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleClick(category.id)}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden lg:inline truncate max-w-[140px] xl:max-w-[180px]">{category.name}</span>
                {category.children && category.children.length > 0 && (
                  <ChevronDown className={`h-3 w-3 hidden lg:block shrink-0 transition-transform duration-200 ${isActive ? "rotate-180" : ""}`} />
                )}
              </button>
            );
          })}

          {/* Shop by Brand button */}
          {brands.length > 0 && (
            <>
              <div className="h-4 w-px bg-primary-foreground/10 mx-1" />
              <button
                className={`flex items-center gap-1.5 px-3 h-full font-heading text-[13px] font-semibold uppercase tracking-wide transition-all ${
                  activeCategory === "__brands__"
                    ? "bg-brand-accent/15 border-b-2 border-brand-accent text-white"
                    : "hover:border-b-2 hover:border-brand-accent/50"
                }`}
                onMouseEnter={() => handleMouseEnter("__brands__")}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleClick("__brands__")}
              >
                <Layers className="h-3.5 w-3.5" />
                {translations.shopByBrand}
                <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${activeCategory === "__brands__" ? "rotate-180" : ""}`} />
              </button>
            </>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Quick links */}
          <Link
            href="/search?sort=newest"
            className="flex items-center gap-1.5 px-3 h-full font-heading text-[13px] font-semibold uppercase tracking-wide hover:border-b-2 hover:border-brand-accent/50 transition-all"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">{translations.newArrivals}</span>
            <span className="bg-brand-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none hidden lg:inline">
              NEW
            </span>
          </Link>
          <Link
            href="/search?price=1-50"
            className="flex items-center gap-1.5 px-3 h-full font-heading text-[13px] font-bold uppercase tracking-wide text-brand-accent hover:border-b-2 hover:border-brand-accent/50 transition-all"
          >
            <Tag className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">{translations.deals}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-brand-accent animate-pulse-dot" />
          </Link>
        </div>
      </nav>

      {/* Mega Menu — Single category */}
      {activeCategory &&
        activeCategory !== "__all__" &&
        activeCategory !== "__brands__" &&
        activeCategoryData && (
          <MegaMenu
            mode="single"
            category={activeCategoryData}
            translations={translations}
            onMouseEnter={handleMegaMenuEnter}
            onMouseLeave={handleMegaMenuLeave}
            onClose={() => setActiveCategory(null)}
          />
        )}

      {/* Mega Menu — All Categories */}
      {activeCategory === "__all__" && (
        <MegaMenu
          mode="all"
          categories={categories}
          translations={translations}
          onMouseEnter={handleMegaMenuEnter}
          onMouseLeave={handleMegaMenuLeave}
          onClose={() => setActiveCategory(null)}
        />
      )}

      {/* Mega Menu — Brands */}
      {activeCategory === "__brands__" && brands.length > 0 && (
        <MegaMenu
          mode="brands"
          brands={brands}
          translations={translations}
          onMouseEnter={handleMegaMenuEnter}
          onMouseLeave={handleMegaMenuLeave}
          onClose={() => setActiveCategory(null)}
        />
      )}
    </div>
  );
}
