"use client";

import { useEffect, useRef } from "react";
import { SearchIcon, ArrowRight } from "lucide-react";
import { useSearchSuggestions } from "@/hooks/use-search-suggestions";
import SearchDropdown, { getItemCount } from "./search-dropdown";
import { useTranslations } from "next-intl";

type Props = {
  placeholder?: string;
};

export default function SearchAutocomplete({ placeholder }: Props) {
  const t = useTranslations("Search");
  const {
    query,
    products,
    categories,
    recentSearches,
    highlightedIndex,
    isOpen,
    setIsOpen,
    handleInputChange,
    handleSubmit,
    handleSelectProduct,
    handleSelectCategory,
    handleSelectSearch,
    handleRemoveRecent,
    handleClearRecents,
    handleKeyDown: hookHandleKeyDown,
  } = useSearchSuggestions();

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [setIsOpen]);

  const totalItems = getItemCount(query, products, categories, recentSearches);

  // Wrap hook's handleKeyDown to also handle Escape blur on the input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      inputRef.current?.blur();
    }
    hookHandleKeyDown(e);
  };

  return (
    <div ref={containerRef} className="relative">
      <form onSubmit={handleSubmit}>
        <div
          className="search-premium flex w-full items-stretch bg-card"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="search-dropdown"
          aria-haspopup="listbox"
        >
          <span className="flex items-center pl-3 pr-2 border-r border-border bg-muted/40">
            <SearchIcon className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="hidden lg:inline ml-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              SEARCH
            </span>
          </span>
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder || t("searchPlaceholder")}
            className="w-full h-11 bg-transparent pl-3 pr-2 text-sm placeholder:text-muted-foreground/70 focus:outline-none"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            aria-autocomplete="list"
            aria-controls="search-dropdown"
            autoComplete="off"
          />
          <button
            type="submit"
            aria-label={t("searchAriaLabel")}
            className="h-11 px-4 bg-foreground hover:bg-accent text-background hover:text-accent-foreground flex items-center justify-center gap-1.5 shrink-0 transition-colors font-heading text-[11px] font-bold uppercase tracking-[0.16em]"
          >
            <span className="hidden md:inline">{t("searchAriaLabel")}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>

      {isOpen && (totalItems > 0 || query) && (
        <SearchDropdown
          query={query}
          products={products}
          categories={categories}
          recentSearches={!query ? recentSearches : []}
          highlightedIndex={highlightedIndex}
          onSelectProduct={handleSelectProduct}
          onSelectCategory={handleSelectCategory}
          onSelectSearch={handleSelectSearch}
          onRemoveRecent={handleRemoveRecent}
          onClearRecents={handleClearRecents}
        />
      )}
    </div>
  );
}
