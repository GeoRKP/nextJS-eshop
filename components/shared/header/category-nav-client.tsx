"use client";

import { useState, useRef, useCallback } from "react";
import { Grid3X3, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Category } from "@/types";
import { getCategoryIcon } from "@/lib/category-icons";
import MegaMenu from "./mega-menu";

type Props = {
  categories: Category[];
  translations: {
    allCategories: string;
    viewAll: string;
    newArrivals: string;
    featured: string;
    popularBrands: string;
    allBrands: string;
    viewAllIn: string;
    products: string;
    subcategories: string;
  };
};

export default function CategoryNavClient({
  categories,
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
    }, 300);
  }, []);

  const activeCategoryData = categories.find((c) => c.id === activeCategory);

  return (
    <div ref={navRef} className="relative">
      <nav className="hidden md:block bg-primary text-primary-foreground relative z-[45]">
        <div className="wrapper flex items-center gap-0 h-12 !py-0 overflow-x-auto scrollbar-hide">
          {/* All Categories button */}
          <button
            aria-expanded={activeCategory === "__all__"}
            aria-haspopup="menu"
            className={`flex items-center gap-1.5 px-4 h-full font-heading text-[12px] font-bold uppercase tracking-[0.12em] transition-all border-b-2 ${
              activeCategory === "__all__"
                ? "border-accent text-accent"
                : "border-transparent text-primary-foreground/85 hover:text-accent hover:border-accent/40"
            }`}
            onMouseEnter={() => handleMouseEnter("__all__")}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick("__all__")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleClick("__all__");
              }
              if (e.key === "Escape") setActiveCategory(null);
            }}
          >
            <Grid3X3 className="h-4 w-4" />
            {translations.allCategories}
            <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${activeCategory === "__all__" ? "rotate-180" : ""}`} />
          </button>

          <div className="h-4 w-px bg-primary-foreground/20 mx-1" />

          {/* Root category items with icons */}
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.name);
            const isActive = activeCategory === category.id;
            return (
              <button
                key={category.id}
                aria-expanded={isActive}
                aria-haspopup="menu"
                className={`flex items-center gap-1.5 px-3 h-full font-heading text-[12px] font-bold uppercase tracking-[0.12em] transition-all border-b-2 ${
                  isActive
                    ? "bg-brand-accent/15 border-brand-accent text-brand-accent"
                    : "border-transparent text-primary-foreground/85 hover:text-brand-accent hover:border-brand-accent/50"
                }`}
                onMouseEnter={() => handleMouseEnter(category.id)}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleClick(category.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleClick(category.id);
                  }
                  if (e.key === "Escape") setActiveCategory(null);
                }}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden md:inline truncate max-w-[180px] xl:max-w-[220px] 2xl:max-w-[260px]" title={category.name}>{category.name}</span>
                {category.children && category.children.length > 0 && (
                  <ChevronDown className={`h-3 w-3 hidden md:block shrink-0 transition-transform duration-200 ${isActive ? "rotate-180" : ""}`} />
                )}
              </button>
            );
          })}

        </div>
      </nav>

      {/* Mega Menus with exit animation */}
      <AnimatePresence>
        {activeCategory &&
          activeCategory !== "__all__" &&
          activeCategoryData && (
            <motion.div
              key="single"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <MegaMenu
                mode="single"
                category={activeCategoryData}
                translations={translations}
                onMouseEnter={handleMegaMenuEnter}
                onMouseLeave={handleMegaMenuLeave}
                onClose={() => setActiveCategory(null)}
              />
            </motion.div>
          )}

        {activeCategory === "__all__" && (
          <motion.div
            key="all"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <MegaMenu
              mode="all"
              categories={categories}
              translations={translations}
              onMouseEnter={handleMegaMenuEnter}
              onMouseLeave={handleMegaMenuLeave}
              onClose={() => setActiveCategory(null)}
            />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
