"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useState, useEffect, useCallback } from "react";
import { Product } from "@/types";

type Props = {
  products: Product[];
  translations: {
    tagline: string;
    subtitle: string;
    shopNow: string;
    browseCollection: string;
  };
};

export default function HeroCarousel({ products, translations }: Props) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const onSelect = useCallback(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
  }, [api]);

  useEffect(() => {
    if (!api) return;
    onSelect();
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api, onSelect]);

  return (
    <section className="relative w-full">
      <Carousel
        setApi={setApi}
        opts={{ loop: true }}
        plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]}
      >
        <CarouselContent>
          {products.map((product) => (
            <CarouselItem key={product.id}>
              <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
                {product.banner ? (
                  <Image
                    src={product.banner}
                    alt={product.name}
                    fill
                    priority
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary/40" />
                )}
                {/* Dramatic overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/40 to-transparent" />

                <div className="relative h-full wrapper flex flex-col justify-center gap-4 md:gap-6">
                  {/* Orange accent bar */}
                  <div className="w-16 h-1 bg-brand-orange rounded-full" />

                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white max-w-2xl leading-[0.95] tracking-tight uppercase">
                    {translations.tagline}
                  </h1>
                  <p className="text-lg md:text-xl text-white/80 max-w-xl font-light">
                    {translations.subtitle}
                  </p>
                  <div className="flex gap-3 mt-2">
                    <Button
                      size="lg"
                      asChild
                      className="bg-brand-orange hover:bg-brand-orange-dark text-white font-bold text-base md:text-lg px-8 py-5 rounded-md uppercase tracking-wide border-0"
                    >
                      <Link href="/search">{translations.shopNow}</Link>
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      asChild
                      className="text-base md:text-lg bg-white/10 backdrop-blur-sm text-white border-2 border-white/40 hover:bg-white/20 font-semibold px-8 py-5 rounded-md"
                    >
                      <Link href={`/product/${product.slug}`}>
                        {translations.browseCollection}
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Bar-style dot indicators - bottom left */}
      {products.length > 1 && (
        <div className="absolute bottom-6 left-5 md:left-10 flex gap-2">
          {products.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={`h-1 rounded-full transition-all duration-300 ${
                current === index
                  ? "w-8 bg-brand-orange"
                  : "w-4 bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
