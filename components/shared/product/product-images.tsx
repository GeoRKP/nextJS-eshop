"use client";

import { useState, useCallback, memo } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

function ProductImages({ images }: { images: string[] }) {
  const t = useTranslations("Common");
  const [current, setCurrent] = useState(0);

  const goTo = useCallback((index: number) => {
    if (index < 0) setCurrent(images.length - 1);
    else if (index >= images.length) setCurrent(0);
    else setCurrent(index);
  }, [images.length]);

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="group/image relative overflow-hidden bg-card cursor-zoom-in aspect-square">
        <Image
          src={images[current]}
          alt={t("productImage")}
          fill
          className="object-contain p-4 transition-transform duration-700 ease-out group-hover/image:scale-125"
          sizes="(max-width: 768px) 100vw, 50vw"
        />

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); goTo(current - 1); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-foreground text-background border border-foreground flex items-center justify-center opacity-100 md:opacity-0 md:group-hover/image:opacity-100 transition-opacity duration-200 hover:bg-accent hover:text-accent-foreground hover:border-accent"
              aria-label={t("previousImage")}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goTo(current + 1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-foreground text-background border border-foreground flex items-center justify-center opacity-100 md:opacity-0 md:group-hover/image:opacity-100 transition-opacity duration-200 hover:bg-accent hover:text-accent-foreground hover:border-accent"
              aria-label={t("nextImage")}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Mono counter — bottom right */}
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-foreground/90 text-accent font-mono text-[11px] font-bold px-2.5 py-1.5 tracking-[0.12em] tabular-nums">
            {String(current + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {images.map((image, index) => (
            <button
              key={image}
              onClick={() => setCurrent(index)}
              aria-current={current === index ? "true" : undefined}
              className={cn(
                "overflow-hidden cursor-pointer border-2 transition-all duration-200 flex-shrink-0 w-[56px] h-[56px] sm:w-[68px] sm:h-[68px] bg-card",
                current === index
                  ? "border-accent"
                  : "border-border hover:border-foreground opacity-70 hover:opacity-100"
              )}
            >
              <Image
                src={image}
                alt={t("thumbnailAlt", { index: index + 1 })}
                width={72}
                height={72}
                className="object-cover w-full h-full"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default memo(ProductImages);
