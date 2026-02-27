import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import { Product } from "@/types";

export default async function HeroSection({ product }: { product: Product }) {
  const t = await getTranslations("Hero");

  return (
    <section className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
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
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
      <div className="relative h-full wrapper flex flex-col justify-center gap-4 md:gap-6">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white max-w-2xl leading-tight">
          {t("tagline")}
        </h1>
        <p className="text-base md:text-lg text-white/90 max-w-lg">
          {t("subtitle")}
        </p>
        <div className="flex gap-3 mt-2">
          <Button size="lg" asChild className="text-base">
            <Link href="/search">{t("shopNow")}</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="text-base bg-white/10 text-white border-white/30 hover:bg-white/20"
          >
            <Link href={`/product/${product.slug}`}>
              {t("browseCollection")}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
