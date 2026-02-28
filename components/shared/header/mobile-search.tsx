"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, SearchIcon, X, Clock } from "lucide-react";
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
      {/* Search header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2">
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Search..."
            className="flex-1 rounded-full"
            autoComplete="off"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                setQuery("");
                setProducts([]);
                setCategoryResults([]);
                inputRef.current?.focus();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button type="submit" size="icon" className="bg-brand-orange hover:bg-brand-orange-dark text-white rounded-full shrink-0">
            <SearchIcon className="h-4 w-4" />
          </Button>
        </form>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {/* Recent searches */}
        {showRecents && (
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
                Recent Searches
              </span>
              <button
                onClick={clearAll}
                className="text-xs text-brand-orange hover:underline"
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
                  className="text-muted-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Product suggestions */}
        {showProducts && (
          <div className="p-3">
            <span className="text-xs font-bold text-brand-orange uppercase tracking-wide">
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
                  width={44}
                  height={44}
                  className="rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{product.name}</p>
                  <p className="text-[10px] text-brand-orange font-bold uppercase tracking-wide">{product.brand}</p>
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
            <span className="text-xs font-bold text-brand-orange uppercase tracking-wide">
              Categories
            </span>
            {categoryResults.map((cat) => (
              <button
                key={cat.category}
                onClick={() => navigateToCategory(cat.category)}
                className="flex items-center gap-2 w-full py-2.5 text-sm text-left hover:text-brand-orange transition-colors"
              >
                {cat.category}
                <span className="text-xs text-muted-foreground">
                  ({cat.count})
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Search for query */}
        {query && (
          <div className="p-3 border-t">
            <button
              onClick={() => navigateToSearch(query)}
              className="flex items-center gap-2 w-full py-2 text-sm hover:text-brand-orange transition-colors"
            >
              <SearchIcon className="h-3.5 w-3.5 text-muted-foreground" />
              Search for &quot;{query}&quot;
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
