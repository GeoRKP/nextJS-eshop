"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, SearchIcon, X, Clock, ArrowRight } from "lucide-react";
import { useRecentSearches } from "@/hooks/use-recent-searches";
import { motion } from "framer-motion";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import type {
  ProductSuggestion,
  CategorySuggestion,
  SuggestionsResponse,
} from "@/types/search";

type Props = {
  onClose: () => void;
};

export default function MobileSearch({ onClose }: Props) {
  const router = useRouter();
  const { searches, addSearch, removeSearch, clearAll } = useRecentSearches();
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<ProductSuggestion[]>([]);
  const [categoryResults, setCategoryResults] = useState<CategorySuggestion[]>([]);

  // Auto-focus on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
    return () => {
      abortRef.current?.abort();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

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
      })
      .catch(() => {});
  }, []);

  const handleInputChange = useCallback(
    (value: string) => {
      setQuery(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => fetchSuggestions(value), 250);
    },
    [fetchSuggestions]
  );

  const navigateToSearch = (term: string) => {
    addSearch(term);
    onClose();
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  const navigateToProduct = (slug: string) => {
    onClose();
    router.push(`/product/${slug}`);
  };

  const navigateToCategory = (category: string) => {
    onClose();
    router.push(`/search?category=${encodeURIComponent(category)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) navigateToSearch(query.trim());
  };

  const showRecents = !query && searches.length > 0;
  const showProducts = query && products.length > 0;
  const showCategories = query && categoryResults.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-background flex flex-col"
    >
      {/* Search header — dark themed */}
      <div className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground">
        <Button variant="ghost" size="icon" onClick={onClose} className="text-primary-foreground hover:bg-white/10">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2">
          <div className="flex-1 flex items-center bg-white/10 rounded-full border border-white/20 px-3">
            <SearchIcon className="h-4 w-4 text-primary-foreground/60 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Search..."
              className="flex-1 h-11 bg-transparent pl-2 text-sm text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none"
              autoComplete="off"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setProducts([]);
                  setCategoryResults([]);
                  inputRef.current?.focus();
                }}
                className="text-primary-foreground/60 hover:text-primary-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <button type="submit" className="h-10 w-10 rounded-full bg-brand-accent text-white flex items-center justify-center shrink-0">
            <SearchIcon className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {/* Recent searches */}
        {showRecents && (
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-label text-muted-foreground">
                Recent Searches
              </span>
              <button
                onClick={clearAll}
                className="text-xs text-brand-accent hover:underline"
              >
                Clear all
              </button>
            </div>
            {searches.map((term) => (
              <div
                key={term}
                className="flex items-center justify-between py-2"
              >
                <button
                  onClick={() => navigateToSearch(term)}
                  className="flex items-center gap-2 text-sm"
                >
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  {term}
                </button>
                <button
                  onClick={() => removeSearch(term)}
                  className="text-muted-foreground p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Product suggestions */}
        {showProducts && (
          <div className="p-3">
            <span className="text-label text-muted-foreground">
              Products
            </span>
            {products.map((product) => (
              <button
                key={product.id}
                onClick={() => navigateToProduct(product.slug)}
                className="flex items-center gap-3 w-full py-2.5 text-left hover:bg-accent/50 rounded-lg px-1 transition-colors"
              >
                <Image
                  src={product.image}
                  alt={product.name}
                  width={52}
                  height={52}
                  className="rounded-lg object-cover border"
                  sizes="52px"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{product.name}</p>
                  <p className="text-label text-brand-accent">{product.brand}</p>
                </div>
                <span className="text-sm font-black">
                  {formatCurrency(product.price)}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Category suggestions */}
        {showCategories && (
          <div className="p-3 border-t">
            <span className="text-label text-muted-foreground">
              Categories
            </span>
            {categoryResults.map((cat) => (
              <button
                key={cat.category}
                onClick={() => navigateToCategory(cat.category)}
                className="flex items-center gap-2 w-full py-2.5 text-sm text-left hover:text-brand-accent transition-colors"
              >
                {cat.category}
                <span className="text-xs text-muted-foreground">
                  ({cat.count})
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Search for query — more prominent with amber arrow */}
        {query && (
          <div className="p-3 border-t">
            <button
              onClick={() => navigateToSearch(query)}
              className="flex items-center gap-2 w-full py-3 px-3 text-sm bg-brand-accent/10 hover:bg-brand-accent/20 rounded-lg transition-colors font-medium"
            >
              <SearchIcon className="h-4 w-4 text-brand-accent" />
              Search for &quot;{query}&quot;
              <ArrowRight className="h-4 w-4 ml-auto text-brand-accent" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
