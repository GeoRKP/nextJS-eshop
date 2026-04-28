"use client";

import { Link } from "@/i18n/navigation";
import { Category } from "@/types";
import { getCategoryIcon } from "@/lib/category-icons";
import { LayoutGrid, ChevronDown, ChevronRight } from "lucide-react";

type Props = {
  categories: Category[];
  allLabel: string;
};

export default function MobileCategoryChipsClient({
  categories,
  allLabel,
}: Props) {
  return (
    <div className="md:hidden border-b bg-background">
      <div className="relative">
        {/* Left fade indicator */}
        <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />

        <div className="flex items-center gap-2 px-4 py-2.5 overflow-x-auto scrollbar-hide scroll-snap-x">
          {/* All chip — larger with chevron */}
          <Link
            href="/search"
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-brand-accent text-accent-foreground rounded-lg whitespace-nowrap shrink-0 shadow-sm scroll-snap-start"
          >
            <LayoutGrid className="h-3 w-3" />
            {allLabel}
            <ChevronDown className="h-3 w-3" />
          </Link>

          {/* Category chips — industrial rounded-lg */}
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.name);
            return (
              <Link
                key={category.id}
                href={`/search?category=${encodeURIComponent(category.name)}`}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium bg-card border border-border hover:border-brand-accent/50 rounded-lg whitespace-nowrap shrink-0 transition-colors shadow-inner-soft scroll-snap-start"
              >
                <Icon className="h-3 w-3 text-brand-accent" />
                {category.name}
              </Link>
            );
          })}
        </div>

        {/* Right fade indicator with chevron hint — signals scrollable list */}
        <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-background via-background/90 to-transparent pointer-events-none z-10 flex items-center justify-end pr-1">
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/70" />
        </div>
      </div>
    </div>
  );
}
