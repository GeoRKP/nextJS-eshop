"use client";

import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useView } from "./view-context";

export default function ViewToggle() {
  const { view, setView } = useView();
  const t = useTranslations("Search");

  return (
    <div className="flex items-center bg-muted/50 rounded-lg p-1">
      <button
        onClick={() => setView("grid")}
        className={cn(
          "flex items-center justify-center w-9 h-9 rounded-md transition-all",
          view === "grid"
            ? "bg-card shadow-card-subtle text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label={t("gridView")}
        title={t("gridView")}
      >
        <LayoutGrid className="w-4 h-4" />
      </button>
      <button
        onClick={() => setView("list")}
        className={cn(
          "flex items-center justify-center w-9 h-9 rounded-md transition-all",
          view === "list"
            ? "bg-card shadow-card-subtle text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label={t("listView")}
        title={t("listView")}
      >
        <List className="w-4 h-4" />
      </button>
    </div>
  );
}
