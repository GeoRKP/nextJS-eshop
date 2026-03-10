import { Product } from "@/types";
import ProductCard from "./product-card";
import { getTranslations } from "next-intl/server";
import { AnimatedGrid, AnimatedGridItem } from "./animated-grid";
import { getWishlistProductIds } from "@/lib/actions/wishlist.actions";
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
  const [t, wishlistIds] = await Promise.all([
    getTranslations("Product"),
    getWishlistProductIds(),
  ]);

  return (
    <div className="my-10">
      <div className="flex items-end justify-between mb-4">
        <div>
          {subtitle && (
            <span className="text-label text-brand-accent block mb-1">
              {subtitle}
            </span>
          )}
          {title && <h2 className="h2-bold">{title}</h2>}
        </div>
        {viewAllLabel && viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-brand-accent text-sm font-semibold hover:underline flex items-center gap-1"
          >
            {viewAllLabel}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
      {data.length > 0 ? (
        <AnimatedGrid className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-4">
          {limitedData.map((product: Product) => (
            <AnimatedGridItem key={product.slug}>
              <ProductCard product={product} isInWishlist={wishlistIds.has(product.id)} />
            </AnimatedGridItem>
          ))}
        </AnimatedGrid>
      ) : (
        <div>
          <p>{t("noProductsFound")}</p>
        </div>
      )}
    </div>
  );
}
