"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function ProductImages({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg cursor-zoom-in">
        <Image
          src={images[current]}
          alt="Product Image"
          width={1000}
          height={1000}
          className="min-h-[300px] object-cover object-center hover:scale-150 transition-transform duration-500 ease-out"
        />
      </div>
      <div className="flex">
        {images.map((image, index) => (
          <div
            key={image}
            onClick={() => setCurrent(index)}
            className={cn(
              "rounded-md overflow-hidden mr-2 cursor-pointer border-2 transition-all duration-200",
              current === index
                ? "border-primary ring-2 ring-primary/20"
                : "border-transparent hover:border-muted-foreground/30"
            )}
          >
            <Image src={image} alt="Product Image" width={100} height={100} />
          </div>
        ))}
      </div>
    </div>
  );
}
