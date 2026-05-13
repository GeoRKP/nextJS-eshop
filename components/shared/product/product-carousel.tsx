"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Product } from "@/types";
import Autoplay from "embla-carousel-autoplay";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import Image from "next/image";
import { localizedName } from "@/lib/i18n-helpers";

export default function ProductCarousel({ data }: { data: Product[] }) {
  const locale = useLocale();
  return (
    <Carousel
      className="w-full mb-12"
      opts={{
        loop: true,
      }}
      plugins={[
        Autoplay({
          delay: 10000,
          stopOnInteraction: true,
          stopOnMouseEnter: true,
        }),
      ]}
    >
      <CarouselContent>
        {data.filter((p) => p.banner).map((product: Product) => {
          const displayName = localizedName(product, locale);
          return (
            <CarouselItem key={product.id}>
              <Link href={`/product/${product.slug}`}>
                <div className="relative mx-auto">
                  <Image
                    src={product.banner!}
                    alt={displayName}
                    width='0'
                    height='0'
                    sizes="100vw"
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 flex items-end justify-end">
                    <div className="h-2 bg-foreground/50 text-2xl font-bold px-2 text-background">
                      {displayName}
                    </div>
                  </div>
                </div>
              </Link>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />

    </Carousel>
  );
}
