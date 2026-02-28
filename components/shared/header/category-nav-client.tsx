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
      <nav className="hidden md:block bg-primary text-primary-foreground">
        <div className="wrapper flex items-center gap-0 h-12 !py-0">
          {/* All Categories button */}
          <button
            className={`flex items-center gap-1.5 px-4 h-full text-sm font-medium transition-all rounded-sm ${
              activeCategory === "__all__"
                ? "bg-brand-orange text-white"
                : "hover:bg-white/10"
            }`}
            onMouseEnter={() => handleMouseEnter("__all__")}
            onMouseLeave={handleMouseLeave}
          >
            <Grid3X3 className="h-4 w-4" />
            {translations.allCategories}
            <ChevronDown className="h-3 w-3" />
          </button>

          <div className="w-px h-5 bg-primary-foreground/20 mx-1" />

          {/* Root category items with icons */}
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.name);
            return (
              <button
                key={category.id}
                className={`flex items-center gap-1.5 px-3 h-full text-sm transition-all rounded-sm ${
                  activeCategory === category.id
                    ? "bg-brand-orange text-white"
                    : "hover:bg-white/10"
                }`}
                onMouseEnter={() => handleMouseEnter(category.id)}
                onMouseLeave={handleMouseLeave}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">{category.name}</span>
                <span className="lg:hidden">{category.name}</span>
                {category.children && category.children.length > 0 && (
                  <ChevronDown className="h-3 w-3 hidden lg:block" />
                )}
              </button>
            );
          })}

          {/* Shop by Brand button */}
          {brands.length > 0 && (
            <>
              <div className="w-px h-5 bg-primary-foreground/20 mx-1" />
              <button
                className={`flex items-center gap-1.5 px-3 h-full text-sm transition-all rounded-sm ${
                  activeCategory === "__brands__"
                    ? "bg-brand-orange text-white"
                    : "hover:bg-white/10"
                }`}
                onMouseEnter={() => handleMouseEnter("__brands__")}
                onMouseLeave={handleMouseLeave}
              >
                <Layers className="h-3.5 w-3.5" />
                {translations.shopByBrand}
                <ChevronDown className="h-3 w-3" />
              </button>
            </>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Quick links */}
          <Link
            href="/search?sort=newest"
            className="flex items-center gap-1.5 px-3 h-full text-sm hover:bg-white/10 transition-all rounded-sm"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">{translations.newArrivals}</span>
            <span className="bg-brand-orange text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none hidden lg:inline">
              NEW
            </span>
          </Link>
          <Link
            href="/search?price=1-50"
            className="flex items-center gap-1.5 px-3 h-full text-sm font-bold text-brand-orange hover:bg-white/10 transition-all rounded-sm"
          >
            <Tag className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">{translations.deals}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-brand-orange animate-pulse-dot" />
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
