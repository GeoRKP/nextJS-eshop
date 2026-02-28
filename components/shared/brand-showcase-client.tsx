"use client";

import { Link } from "@/i18n/navigation";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

type BrandItem = { brand: string; _count: number };

export default function BrandShowcaseClient({
  brands,
}: {
  brands: BrandItem[];
}) {
  return (
    <Carousel
      opts={{
        align: "start",
        loop: brands.length > 5,
      }}
      className="w-full"
    >
      <CarouselContent className="-ml-3">
        {brands.map((b) => (
          <CarouselItem
            key={b.brand}
            className="pl-3 basis-[45%] sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6"
          >
            <Link
              href={`/search?q=all&category=all&brand=${encodeURIComponent(b.brand)}`}
              className="flex flex-col items-center p-6 rounded-xl bg-card border border-border hover:border-brand-orange/50 hover:shadow-md transition-all"
            >
              <div className="h-16 w-16 rounded-full bg-brand-orange/10 flex items-center justify-center mb-3">
                <span className="text-2xl font-black text-brand-orange">
                  {b.brand.charAt(0).toUpperCase()}
                </span>
              </div>
              <p className="font-bold text-sm text-center truncate w-full">
                {b.brand}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {b._count} products
              </p>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden md:flex -left-4 bg-brand-orange text-white hover:bg-brand-orange-dark border-0 shadow-lg" />
      <CarouselNext className="hidden md:flex -right-4 bg-brand-orange text-white hover:bg-brand-orange-dark border-0 shadow-lg" />
    </Carousel>
  );
}
