"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type View = "grid" | "list";

const ViewContext = createContext<{
  view: View;
  setView: (v: View) => void;
} | null>(null);

export function ViewProvider({
  initialView,
  children,
}: {
  initialView: View;
  children: ReactNode;
}) {
  const [view, setViewState] = useState<View>(initialView);

  // Update React state and persist to URL via history.replaceState — this
  // does NOT trigger a server round-trip, unlike router.push(). The view is
  // pure layout, so re-fetching products + categories + price range was
  // wasted work that made toggling feel laggy.
  const setView = (v: View) => {
    setViewState(v);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("view", v);
      window.history.replaceState({}, "", url.toString());
    }
  };

  return (
    <ViewContext.Provider value={{ view, setView }}>
      {children}
    </ViewContext.Provider>
  );
}

export function useView() {
  const ctx = useContext(ViewContext);
  if (!ctx) throw new Error("useView must be used within ViewProvider");
  return ctx;
}
