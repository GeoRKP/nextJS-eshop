"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "geo-store-recent-searches";
const MAX_SEARCHES = 10;

export function useRecentSearches() {
  const [searches, setSearches] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setSearches(JSON.parse(stored));
    } catch {
      // ignore corrupted data
    }
  }, []);

  const persist = useCallback((next: string[]) => {
    setSearches(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const addSearch = useCallback(
    (term: string) => {
      const trimmed = term.trim();
      if (!trimmed) return;
      const next = [trimmed, ...searches.filter((s) => s !== trimmed)].slice(
        0,
        MAX_SEARCHES
      );
      persist(next);
    },
    [searches, persist]
  );

  const removeSearch = useCallback(
    (term: string) => {
      persist(searches.filter((s) => s !== term));
    },
    [searches, persist]
  );

  const clearAll = useCallback(() => {
    persist([]);
  }, [persist]);

  return { searches, addSearch, removeSearch, clearAll };
}
