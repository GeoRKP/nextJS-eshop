"use client";

import { useEffect, useRef } from "react";
import { SearchIcon, ArrowRight } from "lucide-react";
import { useSearchSuggestions } from "@/hooks/use-search-suggestions";
import SearchDropdown, { getItemCount } from "./search-dropdown";

type Props = {
  placeholder?: string;
};

export default function SearchAutocomplete({ placeholder }: Props) {
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
          className="search-premium flex w-full items-center bg-muted/30"
          role="combobox"
          aria-expanded={isOpen}
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
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            aria-autocomplete="list"
            aria-controls="search-dropdown"
            autoComplete="off"
          />
          <button
            type="submit"
            aria-label="Search"
            className="h-8 w-8 rounded-full bg-brand-accent hover:bg-brand-accent-dark text-white flex items-center justify-center shrink-0 mr-1 transition-colors"
          >
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
