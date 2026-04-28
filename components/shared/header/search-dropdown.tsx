"use client";

import { memo, useMemo } from "react";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import type { ProductSuggestion, CategorySuggestion } from "@/types/search";
import { Clock, SearchIcon, Tag, X } from "lucide-react";
import { useTranslations } from "next-intl";

type Props = {
  query: string;
  products: ProductSuggestion[];
  categories: CategorySuggestion[];
  recentSearches: string[];
  highlightedIndex: number;
  onSelectProduct: (slug: string) => void;
  onSelectCategory: (category: string) => void;
  onSelectSearch: (term: string) => void;
  onRemoveRecent: (term: string) => void;
  onClearRecents: () => void;
};

function SearchDropdown({
  query,
  products,
  categories,
  recentSearches,
  highlightedIndex,
  onSelectProduct,
  onSelectCategory,
  onSelectSearch,
  onRemoveRecent,
  onClearRecents,
}: Props) {
  const t = useTranslations("Search");
  const showRecents = !query && recentSearches.length > 0;
  const showProducts = query && products.length > 0;
  const showCategories = query && categories.length > 0;
  const showFallback = query && products.length === 0 && categories.length === 0;

  // Pre-calculate indices for keyboard navigation
  const indices = useMemo(() => {
    const result = {
      recents: [] as number[],
      products: [] as number[],
      categories: [] as number[],
      searchAll: -1,
    };
    let idx = 0;
    if (!query && recentSearches.length > 0) {
      for (let i = 0; i < recentSearches.length; i++) {
        result.recents.push(idx++);
      }
    }
    if (query && products.length > 0) {
      for (let i = 0; i < products.length; i++) {
        result.products.push(idx++);
      }
    }
    if (query && categories.length > 0) {
      for (let i = 0; i < categories.length; i++) {
        result.categories.push(idx++);
      }
    }
    if (query && (products.length > 0 || categories.length > 0)) {
      result.searchAll = idx;
    } else if (query && products.length === 0 && categories.length === 0) {
      result.searchAll = 0;
    }
    return result;
  }, [query, products.length, categories.length, recentSearches.length]);

  return (
    <div
      id="search-dropdown"
      className="absolute top-full left-0 right-0 z-[55] mt-2 max-h-[50vh] md:max-h-[400px] overflow-y-auto rounded-none border border-t-[3px] border-t-brand-accent bg-popover shadow-elevated animate-in fade-in slide-in-from-top-1 duration-150"
      role="listbox"
    >
      {/* Recent searches */}
      {showRecents && (
        <div className="p-3">
          <div className="flex items-center justify-between px-1 pb-2">
            <span className="text-label text-muted-foreground">
              {t("recentSearches")}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onClearRecents();
              }}
              className="text-xs text-muted-foreground hover:text-foreground px-2 py-1"
            >
              {t("clearAll")}
            </button>
          </div>
          {recentSearches.map((term, i) => {
            const idx = indices.recents[i];
            return (
              <div
                key={term}
                role="option"
                aria-selected={highlightedIndex === idx}
                className={`flex cursor-pointer items-center justify-between rounded-lg px-2 py-2 text-sm ${
                  highlightedIndex === idx ? "bg-brand-accent/10 text-brand-accent" : ""
                }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelectSearch(term);
                }}
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{term}</span>
                </div>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onRemoveRecent(term);
                  }}
                  className="text-muted-foreground hover:text-foreground p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Product suggestions */}
      {showProducts && (
        <div className="p-3">
          <span className="text-label text-muted-foreground px-1">
            {t("productsSection")}
          </span>
          {products.map((product, i) => {
            const idx = indices.products[i];
            return (
              <div
                key={product.id}
                role="option"
                aria-selected={highlightedIndex === idx}
                className={`flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 ${
                  highlightedIndex === idx ? "bg-brand-accent/10 text-brand-accent" : ""
                }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelectProduct(product.slug);
                }}
              >
                <Image
                  src={product.image}
                  alt={product.name}
                  width={56}
                  height={56}
                  className="w-11 h-11 md:w-14 md:h-14 rounded-none object-cover border border-border bg-muted/30 bg-blueprint-grid-sm shrink-0"
                  sizes="(max-width: 768px) 44px, 56px"
                />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">
                    {product.name}
                  </p>
                  <p className="text-label text-muted-foreground">
                    {product.brand}
                  </p>
                </div>
                <span className="text-sm font-bold whitespace-nowrap">
                  {formatCurrency(product.price)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Category suggestions */}
      {showCategories && (
        <div className="p-3 border-t">
          <span className="text-label text-muted-foreground px-1">
            {t("categoriesSection")}
          </span>
          {categories.map((cat, i) => {
            const idx = indices.categories[i];
            return (
              <div
                key={cat.category}
                role="option"
                aria-selected={highlightedIndex === idx}
                className={`flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm ${
                  highlightedIndex === idx ? "bg-brand-accent/10 text-brand-accent" : ""
                }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelectCategory(cat.category);
                }}
              >
                <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{cat.category}</span>
                <span className="text-xs text-muted-foreground">
                  ({cat.count})
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Fallback: search for query */}
      {showFallback && (
        <div className="p-3">
          <div
            role="option"
            aria-selected={highlightedIndex === indices.searchAll}
            className={`flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm ${
              highlightedIndex === indices.searchAll ? "bg-brand-accent/10 text-brand-accent" : ""
            }`}
            onMouseDown={(e) => {
              e.preventDefault();
              onSelectSearch(query);
            }}
          >
            <SearchIcon className="h-3.5 w-3.5 text-muted-foreground" />
            <span>
              {t("searchFor", { query })}
            </span>
          </div>
        </div>
      )}

      {/* "Search for ..." when there ARE suggestions too */}
      {query && (products.length > 0 || categories.length > 0) && (
        <div className="border-t p-3">
          <div
            role="option"
            aria-selected={highlightedIndex === indices.searchAll}
            className={`flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm ${
              highlightedIndex === indices.searchAll ? "bg-brand-accent/10 text-brand-accent" : ""
            }`}
            onMouseDown={(e) => {
              e.preventDefault();
              onSelectSearch(query);
            }}
          >
            <SearchIcon className="h-3.5 w-3.5 text-muted-foreground" />
            <span>
              {t("searchFor", { query })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Calculate total number of selectable items for keyboard navigation.
 */
export default memo(SearchDropdown);

export function getItemCount(
  query: string,
  products: ProductSuggestion[],
  categories: CategorySuggestion[],
  recentSearches: string[]
): number {
  if (!query) return recentSearches.length;
  const base = products.length + categories.length;
  // +1 for the "Search for ..." row
  return base > 0 ? base + 1 : 1;
}
