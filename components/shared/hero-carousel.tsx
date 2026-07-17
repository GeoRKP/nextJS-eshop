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
import { useLocale } from "next-intl";
import { Product } from "@/types";
import { localizedName } from "@/lib/i18n-helpers";

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
    viewAllProducts: string;
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
  const locale = useLocale();

  const priceFormatter = new Intl.NumberFormat(
    locale === "el" ? "el-GR" : "en-US",
    { style: "currency", currency: "EUR" }
  );

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

  // Autoplay must respect prefers-reduced-motion — the global CSS kill-switch
  // only stops transitions, not Embla's programmatic scrolling.
  useEffect(() => {
    if (!api) return;
    const autoplay = api.plugins()?.autoplay;
    if (!autoplay) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stopIfReduced = () => {
      if (mq.matches) autoplay.stop();
    };
    stopIfReduced();
    mq.addEventListener("change", stopIfReduced);
    return () => mq.removeEventListener("change", stopIfReduced);
  }, [api]);

  const totalSlides = products.length;

  return (
    <section className="relative w-full border-y border-foreground/10 bg-foreground">
      <Carousel
        setApi={setApi}
        opts={{ loop: true }}
        plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]}
      >
        <CarouselContent>
          {products.map((product, index) => {
            const slide = slides[index % slides.length];
            const productName = localizedName(product, locale);
            const tagline = slide.tagline || productName;
            return (
              <CarouselItem key={product.id}>
                <div className="relative w-full h-[clamp(440px,62svh,680px)] overflow-hidden">
                  {product.banner ? (
                    product.banner.endsWith('.svg') ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={product.banner}
                        alt={productName}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <Image
                        src={product.banner}
                        alt={productName}
                        fill
                        priority={index === 0}
                        className="object-cover"
                        sizes="100vw"
                      />
                    )
                  ) : (
                    <div className="absolute inset-0 bg-foreground" />
                  )}

                  {/* Blueprint grid overlay — signature touch */}
                  <div
                    className="absolute inset-0 bg-blueprint-grid opacity-[0.06] pointer-events-none"
                    aria-hidden="true"
                  />

                  {/* Directional graphite overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-foreground/85 via-foreground/45 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-foreground/80 to-transparent" />

                  {/* Stencil corner brackets — top-left & bottom-right */}
                  <div className="absolute top-6 left-6 hidden md:block pointer-events-none" aria-hidden="true">
                    <div className="h-6 w-6 border-t-2 border-l-2 border-accent" />
                  </div>
                  <div className="absolute bottom-6 right-6 hidden md:block pointer-events-none" aria-hidden="true">
                    <div className="h-6 w-6 border-b-2 border-r-2 border-accent" />
                  </div>

                  {/* Slide counter — top right */}
                  <div className="absolute top-6 right-6 hidden md:flex items-center gap-3 pointer-events-none" aria-hidden="true">
                    <span className="font-mono text-[11px] tracking-[0.18em] text-background/70 uppercase">
                      {String(index + 1).padStart(2, "0")} / {String(totalSlides).padStart(2, "0")}
                    </span>
                    <div className="h-px w-16 bg-background/30 relative overflow-hidden">
                      {current === index && (
                        <div key={slideKey} className="absolute inset-y-0 left-0 bg-accent animate-progress-fill" />
                      )}
                    </div>
                  </div>

                  {/* Content anchored at bottom */}
                  <div className="relative h-full wrapper flex flex-col justify-end pb-8 md:pb-14">
                    {current === index && (
                      <div key={slideKey}>
                        {/* Stencil label */}
                        {slide.label && (
                          <span
                            className="inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-accent mb-3 md:mb-4 opacity-0 animate-fade-up"
                            style={ANIMATION_STYLE_0}
                          >
                            <span className="h-px w-8 bg-accent" />
                            ▲ {String(index + 1).padStart(2, "0")} / {slide.label}
                          </span>
                        )}

                        {/* Main heading */}
                        <h1
                          className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-background max-w-3xl leading-[0.98] uppercase [text-wrap:balance] opacity-0 animate-fade-up"
                          style={{ ...ANIMATION_STYLE_100, letterSpacing: "-0.025em" }}
                        >
                          {tagline}
                        </h1>

                        {/* Subtitle */}
                        {slide.subtitle && (
                          <p
                            className="hidden sm:block text-base md:text-lg text-background/75 max-w-xl mt-4 leading-relaxed opacity-0 animate-fade-up"
                            style={ANIMATION_STYLE_200}
                          >
                            {slide.subtitle}
                          </p>
                        )}

                        {/* Featured product spec plate */}
                        <Link
                          href={`/product/${product.slug}`}
                          className="mt-4 md:mt-5 inline-flex max-w-full items-center gap-2.5 md:gap-3 border border-background/25 bg-foreground/60 px-3 py-2 md:px-4 md:py-2.5 backdrop-blur-sm transition-colors hover:border-accent opacity-0 animate-fade-up"
                          style={ANIMATION_STYLE_200}
                        >
                          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-accent shrink-0">
                            ▲ {product.brand}
                          </span>
                          <span className="h-3 w-px bg-background/25 shrink-0" aria-hidden="true" />
                          <span className="font-heading text-sm font-bold uppercase tracking-[0.04em] text-background truncate">
                            {productName}
                          </span>
                          <span className="h-3 w-px bg-background/25 shrink-0" aria-hidden="true" />
                          <span className="font-mono text-sm font-medium text-accent tabular-nums shrink-0">
                            {priceFormatter.format(Number(product.price))}
                          </span>
                        </Link>

                        {/* CTA cluster */}
                        <div
                          className="mt-5 md:mt-6 flex flex-wrap items-center gap-4 opacity-0 animate-fade-up"
                          style={ANIMATION_STYLE_300}
                        >
                          <Button
                            size="lg"
                            asChild
                            className="bg-accent hover:bg-background text-accent-foreground hover:text-foreground font-heading font-bold text-sm md:text-base px-8 py-6 rounded-none uppercase tracking-[0.16em] border-0 btn-stamp"
                          >
                            <Link href={`/product/${product.slug}`}>{translations.shopNow} →</Link>
                          </Button>
                          <Link
                            href="/search"
                            className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-background/80 hover:text-accent transition-colors border-b border-background/40 hover:border-accent pb-1"
                          >
                            {translations.viewAllProducts}
                          </Link>
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
    </section>
  );
}
