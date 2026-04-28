"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, SearchIcon, X, Clock, ArrowRight } from "lucide-react";
import { useSearchSuggestions } from "@/hooks/use-search-suggestions";
import { motion } from "framer-motion";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import { useTranslations } from "next-intl";

type Props = {
  onClose: () => void;
};

export default function MobileSearch({ onClose }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    query,
    products,
    categories,
    recentSearches,
    handleInputChange,
    handleSubmit,
    handleSelectProduct,
    handleSelectCategory,
    handleSelectSearch,
    handleRemoveRecent,
    handleClearRecents,
    clearResults,
  } = useSearchSuggestions({ onNavigate: onClose });

  const t = useTranslations("Search");
  const tCommon = useTranslations("Common");

  // Auto-focus on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const showRecents = !query && recentSearches.length > 0;
  const showProducts = query && products.length > 0;
  const showCategories = query && categories.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-background flex flex-col"
    >
      {/* Search header — dark themed */}
      <div className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground">
        <Button variant="ghost" size="icon" onClick={onClose} className="text-primary-foreground hover:bg-background/10">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2">
          <div className="flex-1 flex items-center bg-background/10 rounded-full border border-background/20 px-3">
            <SearchIcon className="h-4 w-4 text-primary-foreground/60 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={tCommon("searchPlaceholder")}
              className="flex-1 h-11 bg-transparent pl-2 text-sm text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none"
              autoComplete="off"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  clearResults();
                  inputRef.current?.focus();
                }}
                className="text-primary-foreground/60 hover:text-primary-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <button type="submit" className="h-10 w-10 rounded-full bg-brand-accent text-accent-foreground flex items-center justify-center shrink-0">
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
                {t("recentSearches")}
              </span>
              <button
                onClick={handleClearRecents}
                className="text-xs text-brand-accent hover:underline"
              >
                {t("clearAll")}
              </button>
            </div>
            {recentSearches.map((term) => (
              <div
                key={term}
                className="flex items-center justify-between py-2"
              >
                <button
                  onClick={() => handleSelectSearch(term)}
                  className="flex items-center gap-2 text-sm"
                >
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  {term}
                </button>
                <button
                  onClick={() => handleRemoveRecent(term)}
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
              {t("productsSection")}
            </span>
            {products.map((product) => (
              <button
                key={product.id}
                onClick={() => handleSelectProduct(product.slug)}
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
              {t("categoriesSection")}
            </span>
            {categories.map((cat) => (
              <button
                key={cat.category}
                onClick={() => handleSelectCategory(cat.category)}
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
              onClick={() => handleSelectSearch(query)}
              className="flex items-center gap-2 w-full py-3 px-3 text-sm bg-brand-accent/10 hover:bg-brand-accent/20 rounded-lg transition-colors font-medium"
            >
              <SearchIcon className="h-4 w-4 text-brand-accent" />
              {t("searchFor", { query })}
              <ArrowRight className="h-4 w-4 ml-auto text-brand-accent" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
