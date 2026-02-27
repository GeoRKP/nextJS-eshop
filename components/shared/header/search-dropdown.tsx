"use client";

import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import type { ProductSuggestion, CategorySuggestion } from "@/types/search";
import { Clock, SearchIcon, Tag, X } from "lucide-react";

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

export default function SearchDropdown({
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
  const showRecents = !query && recentSearches.length > 0;
  const showProducts = query && products.length > 0;
  const showCategories = query && categories.length > 0;
  const showFallback = query && products.length === 0 && categories.length === 0;

  let itemIndex = -1;

  return (
    <div
      id="search-dropdown"
      className="absolute top-full left-0 right-0 z-50 mt-1 max-h-[400px] overflow-y-auto rounded-md border bg-popover shadow-lg"
      role="listbox"
    >
      {/* Recent searches */}
      {showRecents && (
        <div className="p-2">
          <div className="flex items-center justify-between px-2 pb-1">
            <span className="text-xs font-medium text-muted-foreground">
              Recent Searches
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onClearRecents();
              }}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear all
            </button>
          </div>
          {recentSearches.map((term) => {
            itemIndex++;
            const idx = itemIndex;
            return (
              <div
                key={term}
                role="option"
                aria-selected={highlightedIndex === idx}
                className={`flex cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-sm ${
                  highlightedIndex === idx ? "bg-accent" : ""
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
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Product suggestions */}
      {showProducts && (
        <div className="p-2">
          <span className="px-2 text-xs font-medium text-muted-foreground">
            Products
          </span>
          {products.map((product) => {
            itemIndex++;
            const idx = itemIndex;
            return (
              <div
                key={product.id}
                role="option"
                aria-selected={highlightedIndex === idx}
                className={`flex cursor-pointer items-center gap-3 rounded-sm px-2 py-1.5 ${
                  highlightedIndex === idx ? "bg-accent" : ""
                }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelectProduct(product.slug);
                }}
              >
                <Image
                  src={product.image}
                  alt={product.name}
                  width={36}
                  height={36}
                  className="rounded-sm object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">
                    {product.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {product.brand}
                  </p>
                </div>
                <span className="text-sm font-medium whitespace-nowrap">
                  {formatCurrency(product.price)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Category suggestions */}
      {showCategories && (
        <div className="p-2 border-t">
          <span className="px-2 text-xs font-medium text-muted-foreground">
            Categories
          </span>
          {categories.map((cat) => {
            itemIndex++;
            const idx = itemIndex;
            return (
              <div
                key={cat.category}
                role="option"
                aria-selected={highlightedIndex === idx}
                className={`flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm ${
                  highlightedIndex === idx ? "bg-accent" : ""
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
        <div className="p-2">
          <div
            role="option"
            aria-selected={highlightedIndex === 0}
            className={`flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm ${
              highlightedIndex === 0 ? "bg-accent" : ""
            }`}
            onMouseDown={(e) => {
              e.preventDefault();
              onSelectSearch(query);
            }}
          >
            <SearchIcon className="h-3.5 w-3.5 text-muted-foreground" />
            <span>
              Search for &quot;{query}&quot;
            </span>
          </div>
        </div>
      )}

      {/* "Search for ..." when there ARE suggestions too */}
      {query && (products.length > 0 || categories.length > 0) && (
        <div className="border-t p-2">
          {(() => {
            itemIndex++;
            const idx = itemIndex;
            return (
              <div
                role="option"
                aria-selected={highlightedIndex === idx}
                className={`flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm ${
                  highlightedIndex === idx ? "bg-accent" : ""
                }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelectSearch(query);
                }}
              >
                <SearchIcon className="h-3.5 w-3.5 text-muted-foreground" />
                <span>
                  Search for &quot;{query}&quot;
                </span>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

/**
 * Calculate total number of selectable items for keyboard navigation.
 */
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
