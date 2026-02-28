"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { SearchIcon, ArrowRight } from "lucide-react";
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
          className="search-premium flex w-full items-center bg-muted/30"
          role="combobox"
          aria-expanded={open}
          aria-controls="search-dropdown"
          aria-haspopup="listbox"
        >
          <SearchIcon className="h-4 w-4 text-muted-foreground/60 ml-4 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder || "Search..."}
            className="w-full h-10 bg-transparent pl-3 pr-2 text-sm placeholder:italic placeholder:text-muted-foreground/60 focus:outline-none"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            aria-autocomplete="list"
            aria-controls="search-dropdown"
            autoComplete="off"
          />
          <button
            type="submit"
            className="h-8 w-8 rounded-full bg-brand-accent hover:bg-brand-accent-dark text-white flex items-center justify-center shrink-0 mr-1 transition-colors"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
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
