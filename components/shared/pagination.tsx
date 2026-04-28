"use client";

import { useMemo } from "react";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { Button } from "../ui/button";
import { formUrlQuery } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  page: number | string;
  totalPages: number;
  urlParamName?: string;
};

export default function Pagination({
  page,
  totalPages,
  urlParamName,
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("Common");
  const currentPage = Number(page);

  const handleClick = (pageNum: number) => {
    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: urlParamName || "page",
      value: pageNum.toString(),
    });
    router.push(newUrl);
  };

  // Generate page numbers to show — compact on mobile (max 5), full on desktop (max 7)
  const getPageNumbers = (maxVisible: number) => {
    const pages: (number | string)[] = [];
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      const siblings = maxVisible <= 5 ? 0 : 1;
      if (currentPage > 2 + siblings) pages.push("...");
      for (
        let i = Math.max(2, currentPage - siblings);
        i <= Math.min(totalPages - 1, currentPage + siblings);
        i++
      ) {
        pages.push(i);
      }
      if (currentPage < totalPages - 1 - siblings) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const mobilePages = useMemo(() => getPageNumbers(5), [currentPage, totalPages]);
  const desktopPages = useMemo(() => getPageNumbers(7), [currentPage, totalPages]);

  return (
    <nav aria-label={t("pagination")}>
      <div className="inline-flex items-center gap-1.5 bg-card border border-border/50 rounded-xl p-1.5 shadow-card-subtle">
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 rounded-lg"
          disabled={currentPage === 1}
          onClick={() => handleClick(currentPage - 1)}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="sr-only">{t("previous")}</span>
        </Button>

        {/* Mobile: compact pages */}
        <span className="contents sm:hidden">
          {mobilePages.map((p, i) =>
            typeof p === "string" ? (
              <span
                key={`m-ellipsis-${i}`}
                className="w-10 h-10 flex items-center justify-center text-xs text-muted-foreground"
              >
                ...
              </span>
            ) : (
              <Button
                key={p}
                variant={p === currentPage ? "default" : "ghost"}
                size="icon"
                className={`w-10 h-10 rounded-lg text-xs font-medium ${
                  p === currentPage
                    ? "bg-brand-accent text-accent-foreground shadow-sm hover:bg-brand-accent-dark"
                    : "hover:bg-brand-accent/10"
                }`}
                onClick={() => handleClick(p)}
              >
                {p}
              </Button>
            )
          )}
        </span>
        {/* Desktop: full pages */}
        <span className="hidden sm:contents">
          {desktopPages.map((p, i) =>
            typeof p === "string" ? (
              <span
                key={`d-ellipsis-${i}`}
                className="w-10 h-10 flex items-center justify-center text-xs text-muted-foreground"
              >
                ...
              </span>
            ) : (
              <Button
                key={p}
                variant={p === currentPage ? "default" : "ghost"}
                size="icon"
                className={`w-10 h-10 rounded-lg text-xs font-medium ${
                  p === currentPage
                    ? "bg-brand-accent text-accent-foreground shadow-sm hover:bg-brand-accent-dark"
                    : "hover:bg-brand-accent/10"
                }`}
                onClick={() => handleClick(p)}
              >
                {p}
              </Button>
            )
          )}
        </span>

        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 rounded-lg"
          disabled={currentPage >= totalPages}
          onClick={() => handleClick(currentPage + 1)}
        >
          <ChevronRight className="w-4 h-4" />
          <span className="sr-only">{t("next")}</span>
        </Button>
      </div>
    </nav>
  );
}
