import Image from "next/image";
import { Link } from "@/i18n/navigation";

type BrandItem = { brand: string; _count: number };

// Map brand names to their SVG logo files in /images/brands/
const brandLogoMap: Record<string, string> = {
  AVL: "/images/brands/avl.svg",
  Camozzi: "/images/brands/camozzi.svg",
  SORL: "/images/brands/sorl.svg",
  WABCO: "/images/brands/wabco.svg",
  "Knorr-Bremse": "/images/brands/knorr-bremse.svg",
  Haldex: "/images/brands/haldex.svg",
};

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
      <div className="absolute left-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      {/* Right fade */}
      <div className="absolute right-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

      <div className="flex animate-marquee hover:[animation-play-state:paused] w-max">
        {duplicated.map((b, i) => {
          const logoSrc = brandLogoMap[b.brand];

          return (
            <Link
              key={`${b.brand}-${i}`}
              href={`/search?q=all&category=all&brand=${encodeURIComponent(b.brand)}`}
              className="flex flex-col items-center mx-4 md:mx-6 shrink-0"
            >
              <div className="h-16 w-28 md:h-20 md:w-36 rounded-lg bg-card border border-border/60 flex items-center justify-center hover:border-brand-accent/50 hover:shadow-md transition-all p-2">
                {logoSrc ? (
                  <Image
                    src={logoSrc}
                    alt={`${b.brand} logo`}
                    width={200}
                    height={80}
                    className="h-full w-auto object-contain dark:invert"
                  />
                ) : (
                  <span className="text-2xl md:text-3xl font-black text-brand-accent">
                    {b.brand.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <p className="font-bold text-xs md:text-sm text-center mt-2 truncate max-w-[140px]">
                {b.brand}
              </p>
              <p className="text-xs text-muted-foreground">
                {b._count} products
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
