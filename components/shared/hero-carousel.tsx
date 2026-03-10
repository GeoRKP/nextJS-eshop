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

type SlideContent = {
  label: string;
  tagline: string;
  subtitle: string;
};

type Props = {
  products: Product[];
  slides: SlideContent[];
  translations: {
    shopNow: string;
  };
};

// Module-level style constants to avoid creating new objects on every render
const ANIMATION_STYLE_0 = { animationDelay: "0ms", animationFillMode: "forwards" } as const;
const ANIMATION_STYLE_100 = { animationDelay: "100ms", animationFillMode: "forwards" } as const;
const ANIMATION_STYLE_200 = { animationDelay: "200ms", animationFillMode: "forwards" } as const;
const ANIMATION_STYLE_300 = { animationDelay: "300ms", animationFillMode: "forwards" } as const;

export default function HeroCarousel({ products, slides, translations }: Props) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [slideKey, setSlideKey] = useState(0);

  const onSelect = useCallback(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    setSlideKey((k) => k + 1);
  }, [api]);

  useEffect(() => {
    if (!api) return;
    onSelect();
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api, onSelect]);

  const total = products.length;

  return (
    <section className="relative w-full">
      <Carousel
        setApi={setApi}
        opts={{ loop: true }}
        plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]}
      >
        <CarouselContent>
          {products.map((product, index) => {
            const slide = slides[index % slides.length];
            return (
              <CarouselItem key={product.id}>
                <div className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
                  {product.banner ? (
                    product.banner.endsWith('.svg') ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={product.banner}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <Image
                        src={product.banner}
                        alt={product.name}
                        fill
                        priority={index === 0}
                        className="object-cover"
                        sizes="100vw"
                      />
                    )
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary/40" />
                  )}
                  {/* Multi-layer overlay: directional gradient + bottom fade */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/60 to-transparent" />

                  {/* Content anchored at bottom */}
                  <div className="relative h-full wrapper flex flex-col justify-end pb-32 md:pb-24">
                    {current === index && (
                      <div key={slideKey}>
                        {/* Label badge */}
                        <span
                          className="inline-block text-label text-brand-accent mb-4 opacity-0 animate-fade-up"
                          style={ANIMATION_STYLE_0}
                        >
                          {slide.label}
                        </span>

                        {/* Main heading */}
                        <h1
                          className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white max-w-3xl leading-[0.92] tracking-tight uppercase opacity-0 animate-fade-up"
                          style={ANIMATION_STYLE_100}
                        >
                          {slide.tagline}
                        </h1>

                        {/* Subtitle */}
                        <p
                          className="text-lg md:text-xl text-white/80 max-w-xl font-light mt-4 opacity-0 animate-fade-up"
                          style={ANIMATION_STYLE_200}
                        >
                          {slide.subtitle}
                        </p>

                        {/* CTA */}
                        <div
                          className="mt-6 opacity-0 animate-fade-up"
                          style={ANIMATION_STYLE_300}
                        >
                          <Button
                            size="lg"
                            asChild
                            className="bg-brand-accent hover:bg-brand-accent-dark text-white font-bold text-base md:text-lg px-8 py-5 rounded-md uppercase tracking-wide border-0"
                          >
                            <Link href="/search">{translations.shopNow}</Link>
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>

      {/* Slide indicators — centered pills */}
      {total > 1 && (
        <div className="absolute -bottom-1 md:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 min-h-[44px]">
          {products.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                current === index
                  ? "w-10 bg-brand-accent"
                  : "w-2.5 bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Slide counter — bottom right */}
      {total > 1 && (
        <div className="absolute -bottom-1 md:bottom-6 right-5 md:right-10 text-white/60 text-sm font-heading tracking-wider">
          <span className="text-white font-bold">
            {String(current + 1).padStart(2, "0")}
          </span>
          {" / "}
          {String(total).padStart(2, "0")}
        </div>
      )}
    </section>
  );
}
