"use client";

import { Link } from "@/i18n/navigation";
import { Category } from "@/types";
import { getCategoryIcon } from "@/lib/category-icons";
import { LayoutGrid } from "lucide-react";

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
        <div className="flex items-center gap-2 px-4 py-2.5 overflow-x-auto scrollbar-hide">
          {/* All chip */}
          <Link
            href="/search"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-brand-orange text-white rounded-full whitespace-nowrap shrink-0 shadow-sm"
          >
            <LayoutGrid className="h-3 w-3" />
            {allLabel}
          </Link>

          {/* Category chips */}
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.name);
            return (
              <Link
                key={category.id}
                href={`/search?category=${encodeURIComponent(category.name)}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-card border border-border hover:border-brand-orange/50 rounded-full whitespace-nowrap shrink-0 transition-colors shadow-sm"
              >
                <Icon className="h-3 w-3 text-brand-orange" />
                {category.name}
              </Link>
            );
          })}
        </div>

        {/* Right fade indicator */}
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
