"use client";

import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

export default function ProductScrollSection({
  children,
  title,
  count,
  viewAllHref = "/search",
  viewAllLabel,
}: {
  children: React.ReactNode;
  title: string;
  count: number;
  viewAllHref?: string;
  viewAllLabel?: string;
}) {
  if (count === 0) return null;

  return (
    <div className="my-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="h2-bold">{title}</h2>
        {viewAllLabel && (
          <Link
            href={viewAllHref}
            className="text-brand-orange text-sm font-semibold hover:underline flex items-center gap-1"
          >
            {viewAllLabel}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
      <div className="relative">
        <Carousel
          opts={{
            align: "start",
            loop: count > 4,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-3">
            {children}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-4 bg-brand-orange text-white hover:bg-brand-orange-dark border-0 shadow-lg" />
          <CarouselNext className="hidden md:flex -right-4 bg-brand-orange text-white hover:bg-brand-orange-dark border-0 shadow-lg" />
        </Carousel>
        {/* Right fade gradient */}
        <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>
    </div>
  );
}

export function ProductScrollItem({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CarouselItem className="pl-3 basis-[75%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
      {children}
    </CarouselItem>
  );
}
