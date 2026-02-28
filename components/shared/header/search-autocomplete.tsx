"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import { useRecentSearches } from "@/hooks/use-recent-searches";
import SearchDropdown, { getItemCount } from "./search-dropdown";
import type {
  ProductSuggestion,
  CategorySuggestion,
  SuggestionsResponse,
} from "@/types/search";

type Props = {
  placeholder?: string;
};

export default function SearchAutocomplete({ placeholder }: Props) {
  const router = useRouter();
  const { searches, addSearch, removeSearch, clearAll } = useRecentSearches();

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [products, setProducts] = useState<ProductSuggestion[]>([]);
  const [categoryResults, setCategoryResults] = useState<CategorySuggestion[]>(
    []
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch suggestions with debounce
  const fetchSuggestions = useCallback((q: string) => {
    // Cancel previous in-flight request
    abortRef.current?.abort();

    if (!q.trim()) {
      setProducts([]);
      setCategoryResults([]);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    fetch(`/api/search/suggestions?q=${encodeURIComponent(q.trim())}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data: SuggestionsResponse) => {
        setProducts(data.products);
        setCategoryResults(data.categories);
        setHighlightedIndex(-1);
      })
      .catch(() => {
        // aborted or network error — ignore
      });
  }, []);

  // Debounced input handler
  const handleInputChange = useCallback(
    (value: string) => {
      setQuery(value);
      setOpen(true);

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => fetchSuggestions(value), 250);
    },
    [fetchSuggestions]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const totalItems = getItemCount(query, products, categoryResults, searches);

  // Navigate helpers
  const navigateToSearch = useCallback(
    (term: string) => {
      addSearch(term);
      setOpen(false);
      router.push(`/search?q=${encodeURIComponent(term)}`);
    },
    [router, addSearch]
  );

  const navigateToProduct = useCallback(
    (slug: string) => {
      setOpen(false);
      router.push(`/product/${slug}`);
    },
    [router]
  );

  const navigateToCategory = useCallback(
    (category: string) => {
      setOpen(false);
      router.push(`/search?category=${encodeURIComponent(category)}`);
    },
    [router]
  );

  // Resolve the highlighted item action
  const resolveHighlighted = useCallback(() => {
    if (highlightedIndex < 0) {
      if (query.trim()) navigateToSearch(query.trim());
      return;
    }

    if (!query) {
      // Recent searches mode
      const term = searches[highlightedIndex];
      if (term) navigateToSearch(term);
      return;
    }

    // Products → categories → "Search for ..."
    if (highlightedIndex < products.length) {
      navigateToProduct(products[highlightedIndex].slug);
      return;
    }

    const catIdx = highlightedIndex - products.length;
    if (catIdx < categoryResults.length) {
      navigateToCategory(categoryResults[catIdx].category);
      return;
    }

    // Last item = "Search for ..."
    navigateToSearch(query.trim());
  }, [
    highlightedIndex,
    query,
    products,
    categoryResults,
    searches,
    navigateToSearch,
    navigateToProduct,
    navigateToCategory,
  ]);

  // Keyboard handler
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          setOpen(true);
          e.preventDefault();
          return;
        }
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < totalItems - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : totalItems - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          resolveHighlighted();
          break;
        case "Escape":
          setOpen(false);
          setHighlightedIndex(-1);
          inputRef.current?.blur();
          break;
      }
    },
    [open, totalItems, resolveHighlighted]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigateToSearch(query.trim());
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <form onSubmit={handleSubmit}>
        <div
          className="flex w-full items-center"
          role="combobox"
          aria-expanded={open}
          aria-controls="search-dropdown"
          aria-haspopup="listbox"
        >
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder || "Search..."}
            className="w-full h-11 rounded-l-full rounded-r-none border-2 border-r-0 border-muted bg-muted/30 pl-5 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-brand-orange"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            aria-autocomplete="list"
            aria-controls="search-dropdown"
            autoComplete="off"
          />
          <Button type="submit" className="rounded-r-full rounded-l-none shrink-0 h-11 w-12 bg-brand-orange hover:bg-brand-orange-dark text-white border-0">
            <SearchIcon className="h-5 w-5" />
          </Button>
        </div>
      </form>

      {open && (totalItems > 0 || query) && (
        <SearchDropdown
          query={query}
          products={products}
          categories={categoryResults}
          recentSearches={!query ? searches : []}
          highlightedIndex={highlightedIndex}
          onSelectProduct={navigateToProduct}
          onSelectCategory={navigateToCategory}
          onSelectSearch={navigateToSearch}
          onRemoveRecent={removeSearch}
          onClearRecents={clearAll}
        />
      )}
    </div>
  );
}
