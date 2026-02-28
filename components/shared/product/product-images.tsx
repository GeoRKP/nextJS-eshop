"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function ProductImages({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl cursor-zoom-in bg-muted/20 shadow-card-subtle relative">
        <Image
          src={images[current]}
          alt="Product Image"
          width={1000}
          height={1000}
          className="min-h-[300px] object-cover object-center hover:scale-150 transition-transform duration-500 ease-out"
        />
        {/* Image counter badge */}
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
            {current + 1}/{images.length}
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((image, index) => (
            <button
              key={image}
              onClick={() => setCurrent(index)}
              className={cn(
                "rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-200 flex-shrink-0",
                current === index
                  ? "border-brand-orange ring-2 ring-brand-orange/20"
                  : "border-transparent hover:border-muted-foreground/30 opacity-70 hover:opacity-100"
              )}
            >
              <Image src={image} alt="Product Image" width={80} height={80} className="object-cover w-20 h-20" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
