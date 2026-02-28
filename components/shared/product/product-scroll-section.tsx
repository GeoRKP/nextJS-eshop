"use client";

import { Link } from "@/i18n/navigation";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useState, useEffect, useCallback } from "react";

export default function ProductScrollSection({
  children,
  title,
  labelText,
  count,
  viewAllHref = "/search",
  viewAllLabel,
}: {
  children: React.ReactNode;
  title: string;
  labelText?: string;
  count: number;
  viewAllHref?: string;
  viewAllLabel?: string;
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!api) return;
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, [api]);

  useEffect(() => {
    if (!api) return;
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api, onSelect]);

  if (count === 0) return null;

  return (
    <div className="my-10">
      {/* Section header with inline controls */}
      <div className="flex items-end justify-between mb-4">
        <div>
          {labelText && (
            <span className="text-label text-brand-accent block mb-1">
              {labelText}
            </span>
          )}
          <h2 className="h2-bold">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          {/* Prev / Next controls */}
          <button
            onClick={() => api?.scrollPrev()}
            disabled={!canScrollPrev}
            className="hidden md:flex items-center justify-center w-9 h-9 rounded-lg border border-border hover:border-brand-accent hover:text-brand-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => api?.scrollNext()}
            disabled={!canScrollNext}
            className="hidden md:flex items-center justify-center w-9 h-9 rounded-lg border border-border hover:border-brand-accent hover:text-brand-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          {viewAllLabel && (
            <Link
              href={viewAllHref}
              className="text-brand-accent text-sm font-semibold hover:underline flex items-center gap-1 ml-2"
            >
              {viewAllLabel}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>

      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: count > 4,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-3">
          {children}
        </CarouselContent>
      </Carousel>
    </div>
  );
}

export function ProductScrollItem({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CarouselItem className="pl-3 basis-[70%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
      {children}
    </CarouselItem>
  );
}
