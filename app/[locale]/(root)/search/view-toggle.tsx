"use client";

import { LayoutGrid, List } from "lucide-react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export default function ViewToggle({ currentView }: { currentView: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("Search");

  const handleToggle = (view: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", view);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center bg-muted rounded-lg p-1">
      <button
        onClick={() => handleToggle("grid")}
        className={cn(
          "flex items-center justify-center w-9 h-9 rounded-md transition-all",
          currentView === "grid"
            ? "bg-card shadow-card-subtle text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label={t("gridView")}
        title={t("gridView")}
      >
        <LayoutGrid className="w-4 h-4" />
      </button>
      <button
        onClick={() => handleToggle("list")}
        className={cn(
          "flex items-center justify-center w-9 h-9 rounded-md transition-all",
          currentView === "list"
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
