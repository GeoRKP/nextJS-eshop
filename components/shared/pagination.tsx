"use client";

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

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <nav aria-label="Pagination">
      <div className="inline-flex items-center gap-1 bg-card border border-border/50 rounded-xl p-1.5 shadow-card-subtle">
        <Button
          variant="ghost"
          size="icon"
          className="w-9 h-9 rounded-lg"
          disabled={currentPage === 1}
          onClick={() => handleClick(currentPage - 1)}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="sr-only">{t("previous")}</span>
        </Button>

        {getPageNumbers().map((p, i) =>
          typeof p === "string" ? (
            <span
              key={`ellipsis-${i}`}
              className="w-9 h-9 flex items-center justify-center text-xs text-muted-foreground"
            >
              ...
            </span>
          ) : (
            <Button
              key={p}
              variant={p === currentPage ? "default" : "ghost"}
              size="icon"
              className={`w-9 h-9 rounded-lg text-xs font-medium ${
                p === currentPage
                  ? "bg-brand-accent text-white shadow-sm hover:bg-brand-accent-dark"
                  : "hover:bg-brand-accent/10"
              }`}
              onClick={() => handleClick(p)}
            >
              {p}
            </Button>
          )
        )}

        <Button
          variant="ghost"
          size="icon"
          className="w-9 h-9 rounded-lg"
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
