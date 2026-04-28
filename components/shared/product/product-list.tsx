import { Product } from "@/types";
import ProductCard from "./product-card";
import { getTranslations } from "next-intl/server";
import { AnimatedGrid, AnimatedGridItem } from "./animated-grid";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";

export default async function ProductList({
  data,
  title,
  subtitle,
  limit,
  viewAllHref,
  viewAllLabel,
}: {
  data: Product[];
  title?: string;
  subtitle?: string;
  limit?: number;
  viewAllHref?: string;
  viewAllLabel?: string;
}) {
  const limitedData = limit ? data.slice(0, limit) : data;
  const t = await getTranslations("Product");

  return (
    <div className="my-12 md:my-16 lg:my-20">
      <div className="flex items-end justify-between mb-8 pb-4 border-b border-foreground/15">
        <div>
          {subtitle && (
            <span className="text-stamp text-accent block mb-2 hazard-mark">
              {subtitle}
            </span>
          )}
          {title && <h2 className="h2-bold">{title}</h2>}
        </div>
        {viewAllLabel && viewAllHref && (
          <Link
            href={viewAllHref}
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground hover:text-accent transition-colors flex items-center gap-2 border-b border-foreground hover:border-accent pb-1"
          >
            {viewAllLabel}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
      {data.length > 0 ? (
        <AnimatedGrid className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-4 2xl:gap-5">
          {limitedData.map((product: Product) => (
            <AnimatedGridItem key={product.slug}>
              <ProductCard product={product} />
            </AnimatedGridItem>
          ))}
        </AnimatedGrid>
      ) : (
        <div className="border border-dashed border-border p-8 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">▲ {t("noProductsFound")}</p>
        </div>
      )}
    </div>
  );
}
