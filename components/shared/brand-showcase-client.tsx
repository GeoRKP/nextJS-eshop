"use client";

import { Link } from "@/i18n/navigation";

type BrandItem = { brand: string; _count: number };

export default function BrandShowcaseClient({
  brands,
}: {
  brands: BrandItem[];
}) {
  // Duplicate brands for seamless infinite scroll
  const duplicated = [...brands, ...brands];

  return (
    <div className="relative overflow-hidden">
      {/* Left fade */}
      <div className="absolute left-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      {/* Right fade */}
      <div className="absolute right-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

      <div className="flex animate-marquee hover:[animation-play-state:paused] w-max">
        {duplicated.map((b, i) => (
          <Link
            key={`${b.brand}-${i}`}
            href={`/search?q=all&category=all&brand=${encodeURIComponent(b.brand)}`}
            className="flex flex-col items-center mx-4 md:mx-6 shrink-0"
          >
            <div className="h-16 w-16 md:h-20 md:w-20 rounded-lg bg-card border border-border/60 flex items-center justify-center hover:border-brand-accent/50 hover:shadow-md transition-all">
              <span className="text-2xl md:text-3xl font-black text-brand-accent">
                {b.brand.charAt(0).toUpperCase()}
              </span>
            </div>
            <p className="font-bold text-xs md:text-sm text-center mt-2 truncate max-w-[80px]">
              {b.brand}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {b._count} products
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
