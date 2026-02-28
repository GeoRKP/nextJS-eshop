"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ProductImages({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);

  const goTo = (index: number) => {
    if (index < 0) setCurrent(images.length - 1);
    else if (index >= images.length) setCurrent(0);
    else setCurrent(index);
  };

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div className="group/image relative overflow-hidden rounded-lg bg-muted/20 border border-border/30 cursor-zoom-in aspect-square">
        <Image
          src={images[current]}
          alt="Product Image"
          fill
          className="object-contain p-4 transition-transform duration-700 ease-out group-hover/image:scale-125"
          sizes="(max-width: 768px) 100vw, 50vw"
        />

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); goTo(current - 1); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-white/80 dark:bg-card/80 backdrop-blur border border-border/50 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity duration-200 hover:bg-white dark:hover:bg-card shadow-sm"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goTo(current + 1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-white/80 dark:bg-card/80 backdrop-blur border border-border/50 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity duration-200 hover:bg-white dark:hover:bg-card shadow-sm"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Centered counter pill */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm tabular-nums">
            {current + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {images.map((image, index) => (
            <button
              key={image}
              onClick={() => setCurrent(index)}
              aria-current={current === index ? "true" : undefined}
              className={cn(
                "rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-200 flex-shrink-0 w-[72px] h-[72px]",
                current === index
                  ? "border-brand-accent ring-2 ring-brand-accent/20"
                  : "border-transparent hover:border-muted-foreground/30 opacity-70 hover:opacity-100"
              )}
            >
              <Image
                src={image}
                alt={`Thumbnail ${index + 1}`}
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
