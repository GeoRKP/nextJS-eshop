"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useRecentSearches } from "@/hooks/use-recent-searches";
import { getItemCount } from "@/components/shared/header/search-dropdown";
import type {
  ProductSuggestion,
  CategorySuggestion,
  SuggestionsResponse,
} from "@/types/search";

type UseSearchSuggestionsConfig = {
  /** Called after any navigation (e.g. to close a mobile overlay or dropdown) */
  onNavigate?: () => void;
};

export function useSearchSuggestions(config: UseSearchSuggestionsConfig = {}) {
  const { onNavigate } = config;
  const router = useRouter();
  const { searches, addSearch, removeSearch, clearAll } = useRecentSearches();

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [products, setProducts] = useState<ProductSuggestion[]>([]);
  const [categories, setCategories] = useState<CategorySuggestion[]>([]);

  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch suggestions (no debounce — caller wraps with debounce)
  const fetchSuggestions = useCallback((q: string) => {
    abortRef.current?.abort();

    if (!q.trim()) {
      setProducts([]);
      setCategories([]);
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
        setCategories(data.categories);
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
      setIsOpen(true);

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => fetchSuggestions(value), 150);
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

  const totalItems = getItemCount(query, products, categories, searches);

  // --- Navigation helpers ---

  const handleSelectSearch = useCallback(
    (term: string) => {
      addSearch(term);
      setIsOpen(false);
      onNavigate?.();
      router.push(`/search?q=${encodeURIComponent(term)}`);
    },
    [router, addSearch, onNavigate]
  );

  const handleSelectProduct = useCallback(
    (slug: string) => {
      setIsOpen(false);
      onNavigate?.();
      router.push(`/product/${slug}`);
    },
    [router, onNavigate]
  );

  const handleSelectCategory = useCallback(
    (category: string) => {
      setIsOpen(false);
      onNavigate?.();
      router.push(`/search?category=${encodeURIComponent(category)}`);
    },
    [router, onNavigate]
  );

  // --- Keyboard navigation ---

  const resolveHighlighted = useCallback(() => {
    if (highlightedIndex < 0) {
      if (query.trim()) handleSelectSearch(query.trim());
      return;
    }

    if (!query) {
      // Recent searches mode
      const term = searches[highlightedIndex];
      if (term) handleSelectSearch(term);
      return;
    }

    // Products -> categories -> "Search for ..."
    if (highlightedIndex < products.length) {
      handleSelectProduct(products[highlightedIndex].slug);
      return;
    }

    const catIdx = highlightedIndex - products.length;
    if (catIdx < categories.length) {
      handleSelectCategory(categories[catIdx].category);
      return;
    }

    // Last item = "Search for ..."
    handleSelectSearch(query.trim());
  }, [
    highlightedIndex,
    query,
    products,
    categories,
    searches,
    handleSelectSearch,
    handleSelectProduct,
    handleSelectCategory,
  ]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          setIsOpen(true);
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
          setIsOpen(false);
          setHighlightedIndex(-1);
          break;
      }
    },
    [isOpen, totalItems, resolveHighlighted]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        handleSelectSearch(query.trim());
      }
    },
    [query, handleSelectSearch]
  );

  // --- Recent search handlers (pass-through for convenience) ---

  const handleRemoveRecent = removeSearch;
  const handleClearRecents = clearAll;

  // Clear results helper (useful for mobile clear button)
  const clearResults = useCallback(() => {
    setQuery("");
    setProducts([]);
    setCategories([]);
  }, []);

  return {
    // State
    query,
    setQuery,
    products,
    categories,
    recentSearches: searches,
    highlightedIndex,
    isOpen,
    setIsOpen,

    // Handlers
    handleInputChange,
    handleSubmit,
    handleSelectProduct,
    handleSelectCategory,
    handleSelectSearch,
    handleRemoveRecent,
    handleClearRecents,
    handleKeyDown,
    clearResults,
  };
}
